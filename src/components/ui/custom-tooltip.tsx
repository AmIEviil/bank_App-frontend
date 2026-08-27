/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState, type JSX } from "react";
import { createPortal } from "react-dom";
import style from "./custom-tooltip-style.module.css";
import type { customClass } from "./tooltip.const";

export type ICustomTooltipClassKey = keyof typeof customClass;

export interface ICustomTooltipClass {
  position: ICustomTooltipClassKey;
  base?: string;
}

export interface ICustomTooltip {
  title?: string;
  content?: string | JSX.Element;
  classname: ICustomTooltipClass;
  children?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export const CustomTooltip = ({
  title,
  content,
  classname,
  children,
  disabled = false,
  style: tooltipStyle,
}: ICustomTooltip) => {
  const triggerRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLElement | null>(null);
  const [show, setShow] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [coords, setCoords] = useState({ top: -9999, left: -9999 });

  const getArrowClass = () => {
    switch (classname.position) {
      case "bottom":
      case "bottom-left":
      case "bottom-right":
        return style.arrowTop;
      case "top":
      case "top-left":
      case "top-right":
        return style.arrowBottom;
      case "left":
      case "left-top":
      case "left-bottom":
        return style.arrowRight;
      default:
        return style.arrowLeft;
    }
  };

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const gap = 10;
    const margin = 8;

    let top = 0;
    let left = 0;

    switch (classname.position) {
      case "top":
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case "top-left":
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left;
        break;
      case "top-right":
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.right - tooltipRect.width;
        break;
      case "bottom":
        top = triggerRect.bottom + gap;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case "bottom-left":
        top = triggerRect.bottom + gap;
        left = triggerRect.left;
        break;
      case "bottom-right":
        top = triggerRect.bottom + gap;
        left = triggerRect.right - tooltipRect.width;
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "left-top":
        top = triggerRect.top;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "left-bottom":
        top = triggerRect.bottom - tooltipRect.height;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case "right-top":
        top = triggerRect.top;
        left = triggerRect.right + gap;
        break;
      case "right-bottom":
        top = triggerRect.bottom - tooltipRect.height;
        left = triggerRect.right + gap;
        break;
      case "right":
      default:
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + gap;
        break;
    }

    const maxLeft = window.innerWidth - tooltipRect.width - margin;
    const maxTop = window.innerHeight - tooltipRect.height - margin;

    setCoords({
      left: Math.max(margin, Math.min(left, maxLeft)),
      top: Math.max(margin, Math.min(top, maxTop)),
    });
  }, [classname.position]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (disabled) {
      setShow(false);
    }
  }, [disabled]);

  useEffect(() => {
    if (!show) return;

    updatePosition();

    const handleReposition = () => updatePosition();

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [show, updatePosition]);

  return (
    <article
      ref={triggerRef}
      className={`${style.toolTip} ${classname.base ?? ""}`}
      onMouseEnter={() => !disabled && setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {isMounted &&
        createPortal(
          <section
            ref={tooltipRef}
            className={`${style.portalTooltip} ${getArrowClass()} ${
              show ? style.showPortal : ""
            }`}
            style={{ top: coords.top, left: coords.left, ...tooltipStyle }}
          >
            {title && <div>{title}</div>}
            {content &&
              (typeof content === "string" ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <div>{content}</div>
              ))}
          </section>,
          document.body,
        )}
    </article>
  );
};
