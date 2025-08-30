
import { camelize } from '@vue/shared'

const classNameToArray = (cls = "") => cls.split(" ").filter((item) => !!item.trim());

export const addClass = (el, cls) => {
    if (!el || !cls.trim())
      return;
    el.classList.add(...classNameToArray(cls));
  };

export const getScrollBarWidth = (namespace) => {
    var _a;
    if (!core.isClient)
      return 0;
    if (scrollBarWidth !== void 0)
      return scrollBarWidth;
    const outer = document.createElement("div");
    outer.className = `${namespace}-scrollbar__wrap`;
    outer.style.visibility = "hidden";
    outer.style.width = "100px";
    outer.style.position = "absolute";
    outer.style.top = "-9999px";
    document.body.appendChild(outer);
    const widthNoScroll = outer.offsetWidth;
    outer.style.overflow = "scroll";
    const inner = document.createElement("div");
    inner.style.width = "100%";
    outer.appendChild(inner);
    const widthWithScroll = inner.offsetWidth;
    (_a = outer.parentNode) == null ? void 0 : _a.removeChild(outer);
    scrollBarWidth = widthNoScroll - widthWithScroll;
    return scrollBarWidth;
  };

  export const getStyle = (element, styleName) => {
    var _a;
    if (!core.isClient || !element || !styleName)
      return "";
    let key = camelize(styleName);
    if (key === "float")
      key = "cssFloat";
    try {
      const style = element.style[key];
      if (style)
        return style;
      const computed = (_a = document.defaultView) == null ? void 0 : _a.getComputedStyle(element, "");
      return computed ? computed[key] : "";
    } catch (e) {
      return element.style[key];
    }
  };

  export const hasClass = (el, cls) => {
    if (!el || !cls)
      return false;
    if (cls.includes(" "))
      throw new Error("className should not contain space.");
    return el.classList.contains(cls);
  };

  export const removeClass = (el, cls) => {
    if (!el || !cls.trim())
      return;
    el.classList.remove(...classNameToArray(cls));
  };