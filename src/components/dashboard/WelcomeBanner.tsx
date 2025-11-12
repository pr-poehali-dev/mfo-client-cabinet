interface WelcomeBannerProps {
  clientName: string;
}

const WelcomeBanner = ({ clientName }: WelcomeBannerProps) => {
  if (!clientName) return null;

  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/30 rounded-xl">
      <h2 className="text-2xl font-montserrat font-bold text-white">
        Здравствуйте, {clientName.split(' ')[0]}! 👋
      </h2>
      <p className="text-sm text-muted-foreground mt-2">
        Рады видеть вас в личном кабинете
      </p>
    </div>
  );
};

export default WelcomeBanner;
