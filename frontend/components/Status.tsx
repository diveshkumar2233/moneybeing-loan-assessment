export default function Status({ value }: { value: string }) {
  return (
    <span className={`badge ${value === 'Eligible' ? 'positive' : 'negative'}`}>
      {value}
    </span>
  );
}
