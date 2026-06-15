import type { CoordinateMapper } from "@/lib/ink/engine";
import type { FocusRegion } from "@/lib/ink/types";

/** Maps zoom-lane pointer events to page coordinates (1:1 with focus rect). */
export function createCoordinateMapper(): CoordinateMapper {
  return {
    laneToPage(laneX, laneY, focus, pageSize, laneSize) {
      const rect = focus.rect;
      const laneW = laneSize?.width ?? rect.w * pageSize.width * focus.zoomFactor;
      const laneH = laneSize?.height ?? rect.h * pageSize.height * focus.zoomFactor;
      const relX = laneW > 0 ? laneX / laneW : 0;
      const relY = laneH > 0 ? laneY / laneH : 0;
      return {
        x: (rect.x + relX * rect.w) * pageSize.width,
        y: (rect.y + relY * rect.h) * pageSize.height,
      };
    },
    pageToLane(pageX, pageY, focus, pageSize, laneSize) {
      const rect = focus.rect;
      const laneW = laneSize?.width ?? rect.w * pageSize.width * focus.zoomFactor;
      const laneH = laneSize?.height ?? rect.h * pageSize.height * focus.zoomFactor;
      const relX = pageSize.width > 0 ? pageX / pageSize.width - rect.x : 0;
      const relY = pageSize.height > 0 ? pageY / pageSize.height - rect.y : 0;
      return {
        x: (relX / rect.w) * laneW,
        y: (relY / rect.h) * laneH,
      };
    },
  };
}
