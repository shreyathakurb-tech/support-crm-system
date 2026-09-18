function SearchBar({ search, onSearchChange }) {
  return (
    <input
      className="search-input"
      type="text"
      placeholder="Search by ID, name, email, subject, or description"
      value={search}
      onChange={(event) => onSearchChange(event.target.value)}
    />
  );
}

export default SearchBar;