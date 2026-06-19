export interface ButtonStyleConfig {
  cornerRadius: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontFamily: string;
  fontSize: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
}

export function createDefaultButtonStyleConfig(): ButtonStyleConfig {
  return {
    cornerRadius: 3,
    bold: false,
    italic: true,
    underline: false,
    fontFamily: 'Arimo',
    fontSize: '20 px',
    color: 'var(--qo-color-neutral-900)',
    strokeColor: 'var(--qo-color-neutral-900)',
    strokeWidth: 0,
    paddingTop: 12,
    paddingRight: 15,
    paddingBottom: 12,
    paddingLeft: 15,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0,
  };
}
