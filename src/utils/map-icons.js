import L from "leaflet";

/**
 * Creates a modern, SVG-based custom Leaflet marker icon
 * Avoids broken image links and fits modern pastel theme
 */
export function createCustomMarker(color = "#18181B") {
  return L.divIcon({
    className: "custom-leaflet-marker",
    html: `
      <div style="
        position: relative;
        width: 30px;
        height: 30px;
        background-color: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.28);
        border: 2.5px solid #FFFFFF;
        cursor: pointer;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: #FFFFFF;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -32],
  });
}
