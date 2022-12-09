export function clickOutside(node: HTMLElement) {
  const handleClick = (event: MouseEvent) => {
    if (!event.target) return;
    if (!node.contains(event.target as Node)) {
      node.dispatchEvent(new CustomEvent("outclick"));
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}

export function scrollOnCondition(node: HTMLElement, value: boolean = true) {
  if (value) node.scrollIntoView({ behavior: "smooth" });
}
