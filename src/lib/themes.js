export const THEMES = [
  { id: 'void', name: 'Void', color: '#a594ff', background: '#0a0b10' },
  { id: 'ion', name: 'Ion', color: '#d9ff43', background: '#10140c' },
  { id: 'pearl', name: 'Pearl', color: '#335bff', background: '#eeeff4' },
];
export function resolveTheme(value) {
  return THEMES.some((theme) => theme.id === value) ? value : 'void';
}
