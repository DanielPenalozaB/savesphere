export interface BadgeInterface {
    type?: BadgeType;
    size?: BadgeSize;
    style?: BadgeStyle;
    showDot?: boolean;
    className?: string;
    label?: string;
    showStartIcon?: boolean;
    showEndIcon?: boolean;
    icon?: JSX.Element;
}

type BadgeType = 'Badge' | 'Pill';

type BadgeSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

type BadgeStyle = 'outline' | 'solid';