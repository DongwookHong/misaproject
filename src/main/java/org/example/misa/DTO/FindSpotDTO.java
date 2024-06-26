package org.example.misa.DTO;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.example.misa.domain.StoreMember;

// 상점 이름, 상점 위치, 블럭, 층 이미지
public class FindSpotDTO {
    @JsonProperty("blockId")
    private String blockId;
    @JsonProperty("floorNumber")
    private String floorNumber;
    @JsonProperty("floorImage")
    private String floorImage;
    @JsonProperty("storeName")
    private String storeName;

    public FindSpotDTO(String blockId, String floorNumber, String floorImage, String storeName) {
        this.blockId = blockId;
        this.floorNumber = floorNumber;
        this.floorImage = floorImage;
        this.storeName = storeName;
    }

    public static FindSpotDTO of(String blockId, String floorNumber, String floorImage, String storeName) {
        return new FindSpotDTO(blockId, floorNumber, floorImage, storeName);
    }

    //만약 findspot도 편의시설을 포함한다면 수정 필요 (storemember 뿐만 아니라 facility도 추가, blocktype 확인)
    public static FindSpotDTO from(StoreMember storeMember) {
        return new FindSpotDTO(storeMember.getBlock().getBlockId(),
                storeMember.getBlock().getFloor().getFloor(),
                storeMember.getBlock().getFloor().getFloorImgPath(),
                storeMember.getStoreName());
    }
}
