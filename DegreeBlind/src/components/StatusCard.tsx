interface Props {
  title: string;
  message: string;
}

const StatusCard = ({ title, message }: Props) => {
  return (
    <div className="glass-panel rounded-2xl p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4 drop-shadow-sm">{title}</h3>
      <div className="flex items-center justify-center bg-black/5 rounded-2xl border border-dashed border-white/40 shadow-inner p-8 min-h-[120px]">
        <p className="text-gray-500 font-medium text-sm text-center">{message}</p>
      </div>
    </div>
  );
};

export default StatusCard;
