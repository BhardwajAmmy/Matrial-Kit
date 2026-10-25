## ExactHousing Room Studio — Integrated v2

This branch contains the ExactHousing homepage and lightweight procedural Three.js material studio.

Included: the compact two-column material panel, independent surface selections, a completed left-side wall with a glazed opening, the scroll-driven particle-to-floor-plan-to-house story, and the existing process, services and contact sections.

Standalone: download exacthousing-standalone.zip from the latest successful workflow run at https://github.com/BhardwajAmmy/Matrial-Kit/actions/workflows/validate-room-studio.yml. Extract index.html and assets/ into the same preview folder.

WordPress: download exacthousing-wordpress-plugin.zip from the same workflow artifact. Install through Plugins > Add New > Upload Plugin, activate it, and add [exacthousing_studio] to a full-width Elementor page. Use a blank/canvas page template to avoid duplicate theme headers.

The room is a lightweight conceptual web model, not a construction model. The particle story uses a separate 2D canvas. Three.js and OrbitControls load from jsDelivr and require an internet connection.
