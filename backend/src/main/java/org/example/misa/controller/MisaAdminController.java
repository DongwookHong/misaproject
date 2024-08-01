package org.example.misa.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.example.misa.domain.StoreMember;
import org.example.misa.service.AdminService;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@RestController
@Tag(name = "관리자 API", description = "등록, 수정, 삭제(POST, PUT, DELETE)를 담당하는 API")
public class MisaAdminController {

    private final AdminService adminService; //관리자 페이지 접속 후 로그인 성공시 객체 생성

    public MisaAdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping(value = "/api/stores", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "상점 등록", description = "관리자 권한으로 상점 등록시 해당 요청을 담당하는 API")
    public String postStore(@RequestPart("storeMemberForm") StoreMemberForm storeMemberForm, @RequestPart("files") List<MultipartFile> files) throws IOException, JsonProcessingException {

        String storeName = adminService.join(storeMemberForm, files);
        return "new store: " + storeName;
    }

    @PutMapping(value = "/api/stores/{name}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "상점 수정", description = "관리자 권한으로 상점 수정시 해당 요청을 담당하는 API")
    public String updateStore(@PathVariable("name") String name, @RequestPart("storeMemberForm") StoreMemberForm storeMemberForm, @RequestPart("files") List<MultipartFile> files) {

        String storeName = adminService.update(name, storeMemberForm, files);
        return "update store: " + storeName;
    }

    @DeleteMapping("/api/stores/{name}")
    @Operation(summary = "상점 삭제", description = "관리자 권한으로 상점 삭제시 해당 요청을 담당하는 API")
    public String deleteStore(@PathVariable("name") String name) {

        String storeName = adminService.delete(name);
        return "delete store: " + storeName;
    }
}
