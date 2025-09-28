"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

// HeaderTitle accepts a single props object when used in JSX
type HeaderTitleProps = {
  title: string;
  options?: Record<string, string>;
  welcome?: boolean;
};

const HeaderTitle = ({ title, options = {} }: HeaderTitleProps) => {
  const t = useTranslations("HeaderTitle");

  return (
    <div className="relative h-6 w-full">
      <h1
        className={
          "text-xl font-bold transition-opacity duration-700 ease-out absolute inset-0"
        }
      >
        {t(title, { ...options })}
      </h1>
    </div>
  );
};

export { HeaderTitle };
