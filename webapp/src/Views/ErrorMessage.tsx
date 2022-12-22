interface Props {
  header: string;
  description?: string;
}
export default function Error({ header, description }: Props) {
  return (
    <div>
      <b>{header}</b> {description}
    </div>
  );
}
