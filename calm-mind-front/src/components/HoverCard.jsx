import React from "react";

export default function Card({
  as: Tag = "div",
  className = "",
  hover = true,
  children,
  ...props
}) {
  
  const hoverCls = hover
    ? [
        "transform-gpu",
        "transition-transform",
        "transition-shadow",
        "duration-600",                         
        "ease-[cubic-bezier(.2,.8,.2,1)]",     
        "hover:-translate-y-1",
        "hover:scale-[1.01]",
        "hover:shadow-lg",
        "active:translate-y-0.5",
        "motion-reduce:transition-none",
        "motion-reduce:hover:transform-none",
        "motion-reduce:hover:shadow-none",
      ].join(" ")
    : "";

  return (
    <Tag
      className={[
        "bg-card rounded-2xl border border-gray-200 shadow-sm",
        "will-change-transform",               
        hoverCls,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );
}
