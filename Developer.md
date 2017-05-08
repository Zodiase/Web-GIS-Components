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
- try to convert attribute to property (ignore default values and range checks)
- update property with property setter
    - validate new property value and throw when needed
    - update internal models
    - silent update attribute with new property
- if throws
    - print error and revert attribute to the old value if one is available
- else
    - dispatch change event
    - if canceled
        - revert attribute to the old value if one is available
    - else
        - done!

## How to create a new custom element?

- Pick a good base class to start.
    - A new layer? Probably start from `HTMLMapLayerBase` in `map-layer-base`.
    - A new control? Probably start from `HTMLMapControlBase` in `map-control-base`.
    - A new interaction? Probably start from `HTMLMapInteractionBase` in `map-interaction-base`.
    - Something else? Can't be wrong to base off `HTMLElement`.
- Create a folder in `/src/elements/` with a expressive name.
    - A layer should have a folder name starting with `map-layer-`.
    - A control should have a folder name starting with `map-control-`.
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
