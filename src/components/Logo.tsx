import icon from "../assets/icon.png";

interface Props {
  size: number;
}

export default function Logo(props: Props) {
  return (
    <div style={{ width: props.size }}>
      <img src={icon} alt="Logo" width="100%" />
    </div>
  );
}
