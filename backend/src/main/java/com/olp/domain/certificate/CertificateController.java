package com.olp.domain.certificate;

import com.olp.domain.certificate.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/certificate")
public class CertificateController {

    private final CertificateService certificateService;

    @Autowired
    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<Map<String, Object>> checkAndGenerateCertificate(@PathVariable String courseId) {
        return ResponseEntity.ok(certificateService.checkAndGenerateCertificate(courseId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<Map<String, Object>> getCertificate(@PathVariable String courseId) {
        return ResponseEntity.ok(certificateService.getCertificate(courseId));
    }
}
