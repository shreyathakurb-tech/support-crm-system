const statuses = ["All", "Open", "In Progress", "Closed"];

function FilterBar({ status, onStatusChange }) {
  return (
    <div className="filter-tabs">
      {statuses.map((item) => (
        <button
          className={status === item ? "filter-tab active" : "filter-tab"}
          type="button"
          key={item}
          onClick={() => onStatusChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export default FilterBar;