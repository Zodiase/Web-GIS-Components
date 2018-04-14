## Repository Operation Guidelines

1. Only `master` branch is considered stable.
2. Maintain a `master -> dev -> other-stuff` relationship.
3. Branches must have names clearly indicating how they are going to affect the project.
4. Branches must pass linting before merging.
5. Branches should always be squash-merged.
6. Merged branches should be "closed-off" and **never** re-used. Closing-off means:
    1. Tag the branch, `foo` for example, with tag name `merged__foo`.
    2. Don't forget step 1.
    3. Delete the branch.

## Relationship between map and layers

### How simple can layer elements be?

What if layer elements only function as factories?

That is, the layer elements do not store any internal states, but only instantiates a new layer upon request. It does not hold onto the layer instance.

This means the map element would have to detect and handle all changes happening on layer elements. Otherwise, the map element could only reload layers when things change. Which means new layers with new sources will be instantiated every time something changes, potentially causing lots of reloading and flickering.

So no, **layer elements have to hold onto the layers and thus have internal states**.

### Syncing layer changes

When a layer element property changes, it should update the internal models and the changes will be visible on the map right away.

### Child layer scanning

A map instance monitors its child list for layer instances.

To group layers, use the dedicated custom element `<map-layer-group></map-layer-group>`, which monitors its children just like the map.

## Attribute change flow:

- attribute on change
- parse attribute to property
- if fails
  - error and revert attribute to the old value
- else
  - update property (with property setter, throw if error)
    - fill default values
    - verify new property
    - update internal models
    - silent update attribute with new property
    - dispatch change event
    - if canceled
      - revert property and attribute to the old value
    - else
      - done!
  - if fails
    - error and revert attribute to the old value

Not all properties need to reflect their values back to attributes.

## How to create a new custom element?

- Pick a good base class to start.
    - A new vector layer? Probably start from `HTMLMapLayerVector` in `map-layer-vector`.
    - A new normal/raster layer? Probably start from `HTMLMapLayerBase` in `map-layer-base`.
    - A new control? Probably start from `HTMLMapControlBase` in `map-control-base`.
    - A new interaction? Probably start from `HTMLMapInteractionBase` in `map-interaction-base`.
    - Something else? Can't be wrong to base off `HTMLElement`.
- Create a folder in `/src/elements/` with a expressive name.
    - A layer should have a folder name starting with `map-layer-`.
    - A control should have a folder name starting with `map-control-`.
    - An interaction should have a folder name starting with `map-interaction-`.
- Use a `config.js` to export any static configs. It makes these values easier to be used by other components.
- Define and export the class in `index.js` as the default export.
- If it's a custom element, `customElements.define` it in `index.js`.
- Override these when needed:
    - `observedAttributes`
    - `attributeNameToPropertyNameMapping`
    - `propertyNameToAttributeNameMapping`
    - `attributeToPropertyConverters`
    - `propertyToAttributeConverters`
    - `propertyComparators`
- Depending on what class it's basing off, there will be more things to override.
