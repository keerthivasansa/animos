export function clickOutside(node: HTMLElement, callback: () => void) {
  const handleClick = (event: MouseEvent) => {
    if (event.target == null) return;
    if (!node.contains(event.target as Node)) {
      callback();
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
}

export function scrollOnCondition(node: HTMLElement, value = true) {
  if (value) node.scrollIntoView({ behavior: "smooth" });
}
