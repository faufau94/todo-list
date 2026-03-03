export function isValidTitle(title: string): boolean {
  return title.trim().length > 0
}

export function formatTodoInput(title: string, desc: string) {
  return { title: title.trim(), desc: desc.trim() }
}