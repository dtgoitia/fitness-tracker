// import { activeTheme, Theme } from "./globalStyle";

interface Props {
  children: JSX.Element;
}

const BlueprintThemeProvider = ({ children }: Props) => {
  // const className = activeTheme === Theme.dark ? "bp4-dark" : undefined;
  const className = "bp4-dark";
  return <div className={className}>{children} </div>;
};

export default BlueprintThemeProvider;
