import { FilterQuery } from "./domain";

interface Props {
  query: FilterQuery;
  onChange: (query: FilterQuery) => void;
  clearSearch: () => void;
  onFocus: () => void;
}

function SearchBox({
  query,
  onChange: onFilterQueryChange,
  clearSearch,
  onFocus,
}: Props) {
  return (
    <div className="bp4-input-group bp4-large">
      <span className="bp4-icon bp4-icon-filter"></span>
      <input
        type="text"
        className="bp4-input bp4-large"
        value={query}
        onChange={(event: any) => onFilterQueryChange(event.target.value)}
        placeholder="Filter inventory..."
        onFocus={onFocus}
      />
      <button
        className="bp4-button bp4-minimal bp4-intent-warning bp4-icon-cross"
        onClick={() => clearSearch()}
      ></button>
    </div>
  );
}

export default SearchBox;
