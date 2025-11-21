interface OfferDrawButtonProps {
  onOfferDraw: () => void;
  disabled?: boolean;
}

const OfferDrawButton = ({
  onOfferDraw,
  disabled = false,
}: OfferDrawButtonProps) => {
  const handleClick = () => {
    const confirmed = window.confirm(
      "Bạn muốn đề nghị cầu hòa với đối thủ?\n\nĐối thủ sẽ nhận được thông báo và có thể chấp nhận hoặc từ chối."
    );
    if (confirmed) {
      onOfferDraw();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-bold transition flex items-center gap-2"
    >
      🤝 Cầu hòa
    </button>
  );
};

export default OfferDrawButton;
