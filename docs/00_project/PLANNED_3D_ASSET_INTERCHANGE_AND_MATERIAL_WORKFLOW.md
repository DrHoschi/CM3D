# CyberMotion 3D – Planned Asset Interchange, Mesh Reconstruction & Material Workflow

**Status: PLANNED / IDEA RECORDED / NOT AUTHORIZED FOR IMPLEMENTATION**

This note records future CyberMotion capabilities only. It does not modify current WD blocks, frozen capabilities, or authorize implementation. The ideas are deliberately recorded now so they can be reconciled and implemented later as separate blocks without blocking current CyberMotion work.

## 1. Intended CyberMotion Responsibility

CyberMotion remains the primary 3D authoring/editing environment in the planned cross-tool workflow. Candidate future capabilities include:

- robust GLB/3D import and structured mesh/subgroup handling
- geometry inspection and editing
- pivot/origin and transform editing
- material assignment and editing
- texture assignment/replacement and later refinement of texture/material workflows
- UV-related inspection/editing where required by future scope
- preservation/editing of meaningful object/component hierarchy
- future asset interchange/export capabilities, including evaluation of FBX where separately reconciled

## 2. GLB Import → Object Tree → Separation

Imported GLB assets should ultimately be represented meaningfully in the CyberMotion object tree.

Two cases must be distinguished:

1. The GLB already contains separate nodes/meshes/subgroups. CyberMotion should preserve and expose that structure as editable objects/components.
2. The GLB contains one combined mesh. CyberMotion should offer controlled mesh segmentation so the user can define meaningful new objects from regions of that mesh.

Candidate command/workflow:

`Import GLB → inspect hierarchy → select/segment regions → name regions → preview → Separate to Object → object tree`

Separation should remain non-destructive until explicitly confirmed.

## 3. Mesh Segmentation / Object Separation Tools

Candidate complementary selection methods:

- Vertex / Edge / Face selection
- multi-select, box and lasso selection
- Edge Loop and Edge Ring selection
- Connected Component / Mesh Island selection
- brush-based surface painting to add/remove selected regions
- angle/normal/curvature-assisted region selection
- material-boundary and UV-boundary selection where useful
- assisted segmentation / heatmap showing probable natural part boundaries

A preferred interaction is `Suggest → Correct → Confirm → Separate`: CyberMotion proposes a region or boundary, the user corrects it with loop/brush/lasso/manual tools, names it (for example HEAD, BEAM_01, WALL_SOUTH), then explicitly creates a separate object.

## 4. Game / Geometry Optimization

CyberMotion should later evaluate multiple optimization strategies rather than relying on one global polygon-reduction slider.

### 4.1 Classical Mesh Simplification / Decimation

Reduce triangle/polygon count while preserving the important overall shape and silhouette. Critical detail regions may require stronger preservation than broad smooth surfaces.

### 4.2 Semantic / Region-based Optimization

The user can mark meaningful areas and define what geometry is actually required. Example for a building:

- wall → simplify to planar/simple surface
- roof plane → simplify to planar/simple surface
- structural timber beam → retain low-poly geometry
- window/frame → choose geometry or texture representation
- small joints, grain, dirt and decorative detail → candidate for texture/normal representation
- hidden/unneeded internal geometry → candidate for removal

The intent is not merely to reduce a high-poly model numerically, but to reconstruct an efficient game-ready representation based on the visual/structural role of each region.

### 4.3 Geometry-to-Texture Simplification

Where geometry is unnecessary for silhouette, collision or meaningful depth, visible detail may be represented through textures and, where later supported, normal/related maps. This must remain user-controlled and previewable.

### 4.4 LOD / Comparison

Future optimization may produce/evaluate LOD variants and compare original vs optimized assets. Exact LOD contracts and algorithms require separate reconciliation.

## 5. Reference Image Reconstruction / Sketch Recognition

A separate future capability should allow images to become editable CyberMotion sketch/geometry references rather than remaining passive backgrounds only.

Supported reference candidates may include:

- rendered building image
- photograph
- concept art
- photographed hand-drawn pencil sketch

Candidate workflow:

`Reference Image → establish perspective/orientation → detect/suggest contours → user confirms/corrects → create normal CyberMotion sketch geometry → assign planes/surfaces → dimensions/reference scale → extrude/reconstruct`

### 5.1 Perspective / Surface Semantics

For perspective building references, the user should be able to identify meaningful planes/directions such as SOUTH WALL, WEST WALL and ROOF, plus common corners/edges. This provides controlled spatial meaning instead of expecting an opaque one-click reconstruction.

### 5.2 Contour Recognition

CyberMotion may propose visible contours such as:

- external silhouette
- wall/roof boundaries
- structural beam lines
- doors/windows
- other strong drawing/image edges

Detected lines are proposals. The user must be able to accept, reject, move, extend, trim or redraw them.

For photographed hand sketches, imperfect pencil strokes may be interpreted as candidates and normalized into clean lines/arcs/curves after user confirmation.

### 5.3 Convert to Native Editable Sketch

A critical principle: recognized contours should become ordinary editable CyberMotion sketch entities, not a special locked AI result. Existing/future sketch operations, constraints, dimensions and extrusion should then continue to work on them.

### 5.4 Reference Scale

A known measurement supplied by the user (for example a known door width) can establish scale. Additional known measurements may improve/control reconstruction. CyberMotion should not silently claim exact real-world dimensions from a single image without calibration.

### 5.5 Controlled Depth Reconstruction

Reference-derived regions can later receive different depths/extrusions, for example wall base, projecting timber, frames or roof edges. This allows a lightweight 3D model to preserve important silhouette/depth while visual micro-detail remains primarily in textures.

## 6. Relationship to Existing Sketch / Extrusion Direction

The planned reference workflow should build on CyberMotion's normal sketch/geometry model rather than introduce an isolated parallel modeling system. Image recognition is an input/assistance layer; the resulting geometry should remain normal editable CyberMotion project data.

## 7. Relationship to DevForge

Planned responsibility split:

**DevForge:** Inspect → Validate → Optimize/Compare → Prepare

**CyberMotion:** Import → Segment/Separate → Edit/Reconstruct → Material/Texture → Reassemble → Export

DevForge may later provide complementary 3D Asset Inspection / Game Asset Optimization checks for polygon/triangle counts, materials/textures, bounds, hierarchy, rig data, LOD candidates, silhouette comparison and simplification quality.

CyberMotion should not be displaced by that capability. In particular, intentional mesh cutting/separation, geometry reconstruction, sketch editing and material/texture authoring remain CyberMotion responsibilities.

## 8. Cross-tool Asset Handoff

Future interoperability should allow an original or optimized asset to be inspected in DevForge and then opened/continued in CyberMotion without losing essential hierarchy/material information. Conversely, CyberMotion-created game assets may later be checked in DevForge.

Any concrete shared file contract, LOD algorithm, decimation implementation, FBX conversion or round-trip format requires a separate future reconciliation.

## Guardrails

- PLANNED only; no current implementation authorization.
- Existing frozen/current CyberMotion blocks are unchanged.
- No automatic destructive mesh reduction or separation is implied.
- Segmentation remains preview/correction based until explicit confirmation.
- Reference recognition must create controllable/editable results rather than silently replacing user geometry.
- Texture/material editing, FBX support, mesh optimization, segmentation and reference reconstruction may become separate implementation blocks.
- None of these ideas may block the current CyberMotion development sequence.