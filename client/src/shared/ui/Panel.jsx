// The one raised surface. Flat: a 1px rule and a lighter fill, no shadow,
// so hierarchy comes from type and spacing rather than stacked cards.
function Panel({ as: Tag = 'div', className = '', children, ...props }) {
  return (
    <Tag className={`rounded-[var(--radius-ctl)] border border-rule bg-panel ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export default Panel;
