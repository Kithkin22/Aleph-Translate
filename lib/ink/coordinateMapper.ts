import type { CoordinateMapper } from "@/lib/ink/engine";
import type { FocusRegion } from "@/lib/ink/types";

/** Maps zoom-lane pointer events to page coordinates. */
export function createCoordinateMapper(): CoordinateMapper {
  return {
    laneToPage(laneX, laneY, focus, pageSize) {
      const rect = focus.rect;
      const pageX = rect.x * pageSize.width + (laneX / focus.zoomFactor) * rect.w * pageSize.width;
      const pageY = rect.y * pageSize.height + (laneY / focus.zoomFactor) * rect.h * pageSize.height;
      return { x: pageX, y: pageY };
    },
    pageToLane(pageX, pageY, focus, pageSize) {
      const rect = focus.rect;
      const laneX =
        ((pageX / pageSize.width - rect.x) / rect.w) * pageSize.width * focus.zoomFactor;
      const laneY =
        ((pageY / pageSize.height - rect.y) / rect.h) * pageSize.height * focus.zoomFactor;
      return { x: laneX, y: laneY };
    },
  };
}
