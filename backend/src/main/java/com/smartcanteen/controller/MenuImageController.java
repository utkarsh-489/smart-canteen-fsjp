package com.smartcanteen.controller;

import com.smartcanteen.repository.MenuItemRepository;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class MenuImageController {

    private static final long MAX_BYTES = 5L * 1024L * 1024L;

    private final MenuItemRepository menuItemRepository;
    private final Path uploadDir;

    public MenuImageController(MenuItemRepository menuItemRepository) {
        this.menuItemRepository = menuItemRepository;
        this.uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "menu")
                .toAbsolutePath()
                .normalize();
        System.out.println("Smart Canteen image directory: " + uploadDir);
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(
            @PathVariable Long id,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        try {
            if (!menuItemRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "No image file received."));
            }

            if (image.getSize() > MAX_BYTES) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Image must be smaller than 5 MB."));
            }

            String contentType = image.getContentType();
            String extension = extensionFor(contentType, image.getOriginalFilename());
            if (extension == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Please select a JPG, PNG or WEBP image."));
            }

            Files.createDirectories(uploadDir);
            deleteExistingImages(id);

            Path output = uploadDir.resolve("menu-" + id + extension).normalize();
            Path mimeFile = uploadDir.resolve("menu-" + id + ".mime").normalize();

            Files.copy(image.getInputStream(), output, StandardCopyOption.REPLACE_EXISTING);
            Files.writeString(
                    mimeFile,
                    contentType == null ? "application/octet-stream" : contentType,
                    StandardCharsets.UTF_8
            );

            if (!Files.isRegularFile(output) || Files.size(output) == 0) {
                return ResponseEntity.internalServerError()
                        .body(Map.of("message", "Image could not be saved."));
            }

            System.out.printf(
                    "SMART CANTEEN IMAGE SAVED: item=%d file=%s bytes=%d type=%s%n",
                    id, output, Files.size(output), contentType
            );

            return ResponseEntity.ok(Map.of(
                    "message", "Food image uploaded successfully.",
                    "imageUrl", "/api/menu/" + id + "/image"
            ));

        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "message",
                            "Image upload failed: " +
                                    (ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage())
                    ));
        }
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {

        Path imagePath = findImage(id);
        if (imagePath == null) {
            return ResponseEntity.notFound().build();
        }

        try {
            byte[] bytes = Files.readAllBytes(imagePath);
            MediaType mediaType = readMediaType(id, imagePath);

            return ResponseEntity.ok()
                    .cacheControl(CacheControl.noCache().cachePrivate().mustRevalidate().maxAge(0, TimeUnit.SECONDS))
                    .contentType(mediaType)
                    .contentLength(bytes.length)
                    .body(bytes);
        } catch (IOException ex) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private void deleteExistingImages(Long id) throws IOException {
        if (!Files.isDirectory(uploadDir)) return;

        try (DirectoryStream<Path> stream = Files.newDirectoryStream(uploadDir, "menu-" + id + ".*")) {
            for (Path path : stream) {
                Files.deleteIfExists(path);
            }
        }
    }

    private Path findImage(Long id) {
        if (!Files.isDirectory(uploadDir)) return null;

        String[] extensions = {".jpg", ".jpeg", ".png", ".webp"};
        for (String ext : extensions) {
            Path candidate = uploadDir.resolve("menu-" + id + ext);
            if (Files.isRegularFile(candidate)) return candidate;
        }
        return null;
    }

    private MediaType readMediaType(Long id, Path imagePath) {
        try {
            Path mimeFile = uploadDir.resolve("menu-" + id + ".mime");
            if (Files.isRegularFile(mimeFile)) {
                String value = Files.readString(mimeFile).trim();
                if (!value.isBlank()) return MediaType.parseMediaType(value);
            }
        } catch (Exception ignored) {
        }

        String name = imagePath.getFileName().toString().toLowerCase();
        if (name.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (name.endsWith(".webp")) return MediaType.parseMediaType("image/webp");
        return MediaType.IMAGE_JPEG;
    }

    private String extensionFor(String contentType, String originalFilename) {
        if (MediaType.IMAGE_JPEG_VALUE.equalsIgnoreCase(contentType)) return ".jpg";
        if (MediaType.IMAGE_PNG_VALUE.equalsIgnoreCase(contentType)) return ".png";
        if ("image/webp".equalsIgnoreCase(contentType)) return ".webp";

        if (originalFilename != null) {
            String lower = originalFilename.toLowerCase();
            if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return ".jpg";
            if (lower.endsWith(".png")) return ".png";
            if (lower.endsWith(".webp")) return ".webp";
        }
        return null;
    }
}
