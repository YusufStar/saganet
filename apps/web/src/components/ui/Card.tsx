import { forwardRef } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={[
      'bg-white rounded-lg border border-border shadow-sm',
      className,
    ].join(' ')}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div className={['px-6 pt-6 pb-0', className].join(' ')} {...props}>
      {children}
    </div>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
function CardContent({ className = '', children, ...props }: CardContentProps) {
  return (
    <div className={['px-6 py-6', className].join(' ')} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div
      className={['px-6 pb-6 pt-0 flex items-center', className].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
