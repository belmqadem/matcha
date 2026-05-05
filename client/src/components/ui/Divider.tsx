const Divider = () => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-0.5 bg-(--color-primary) rounded-full" />
    <span className="text-xs text-(--color-primary) font-bold tracking-widest">OR</span>
    <div className="flex-1 h-0.5 bg-(--color-primary) rounded-full" />
  </div>
);

export default Divider;
