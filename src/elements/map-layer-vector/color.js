import Color from 'color';

/**
 * A custom color class that has unique default values and string conversion behavior.
 */
export default
class CustomColor {
  /**
   * @param {string} colorString
   */
  constructor (colorString) {
    const isNone = colorString === '' || String(colorString).toLowerCase() === 'none';

    this.color_ = null;

    if (!isNone) {
      try {
        this.color_ = new Color(colorString);
      } catch (error) {
        // `colorString` is not valid color.
        // Keep color as null.
      }
    }
  }

  /**
   * @returns {string}
   */
  toString () {
    const color = this.color_;

    if (color === null) {
      return 'none';
    }

    // Return the simplist form (hex is shorter than rgba).
    if (color.model === 'rgb' && color.valpha === 1) {
      return color.hex();
    }

    return String(color);
  }
}
