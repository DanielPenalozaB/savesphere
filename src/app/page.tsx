import { BellIcon, ChevronIcon, GridDotsIcon } from '@/assets/svg';
import { NotificationsMenu, ThemeSwitcher, UserMenu } from '@/components';
import { PlusIcon } from '../assets/svg/index';

export default function Home() {
    return (
        <>
            <nav className="flex items-center justify-between border-b border-gray-300 px-7 py-4 dark:border-zinc-700">
                <div className="flex items-center gap-8">
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 font-montserrat font-semibold text-savesphere dark:bg-savesphere dark:text-zinc-900">
                        savesphere
                    </span>
                    <ul className="flex items-center gap-4">
                        <li>
                            <a
                                href=""
                                className="text-savesphere-800 dark:text-savesphere"
                            >
                                Dashboard
                            </a>
                        </li>
                        <li>
                            <a
                                href=""
                                className="text-zinc-500 hover:text-savesphere-800 dark:text-zinc-400 hover:dark:text-savesphere"
                            >
                                Movements
                            </a>
                        </li>
                        <li>
                            <a
                                href=""
                                className="text-zinc-500 hover:text-savesphere-800 dark:text-zinc-400 hover:dark:text-savesphere"
                            >
                                Accounts
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="flex items-center gap-6">
                    <ThemeSwitcher />
                    <button
                        type="button"
                        title="Add"
                        className="flex items-center gap-2 rounded-lg border-1.5 border-zinc-400 px-1.5 py-1 text-sm text-zinc-500 dark:text-zinc-300"
                    >
                        <PlusIcon className="h-4 w-4 stroke-zinc-500 stroke-2 dark:stroke-zinc-300" />
                        <span>Add</span>
                    </button>
                    <NotificationsMenu />
                    <UserMenu />
                </div>
            </nav>
            <section className="flex flex-col gap-6 p-6">
                <div className="relative flex flex-col gap-6 overflow-hidden rounded-2xl bg-savesphere p-6">
                    <svg
                        className="absolute left-0 right-0 top-1/2 w-full min-w-[1440px] -translate-y-1/2 stroke-savesphere-200/50 stroke-4"
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="1440"
                        height="560"
                        preserveAspectRatio="none"
                        viewBox="0 0 1440 560"
                    >
                        <g mask='url("#SvgjsMask1050")' fill="none">
                            <path
                                d="M0 454.76L10 449.29L20 457.13L30 410.48L40 346.18L50 380.21L60 434.75L70 473.94L80 501.57L90 468.91L100 460.63L110 421.83L120 408.46L130 450.5L140 516.44L150 469.93L160 512.43L170 451.04L180 420.8L190 460.17L200 439.3L210 470.92L220 523.68L230 487.49L240 439.31L250 505.58L260 546.93L270 518.31L280 558.56L290 517.42L300 528.81L310 519.62L320 544.62L330 493.53L340 433.39L350 382.41L360 321.88L370 277.89L380 250.22L390 302.04L400 326.83L410 338.47L420 309.68L430 357.15L440 365.62L450 399.1L460 382.69L470 396.29L480 338.96L490 403.59L500 394.43L510 403.96L520 400.06L530 449.53L540 495.6L550 537.29L560 554.97L570 531.92L580 502.38L590 481.74L600 501.79L610 461.57L620 395.15L630 333.82L640 402.97L650 378.65L660 318.47L670 257.03L680 202.61L690 253.6L700 297.49L710 273.31L720 317.65L730 349.2L740 347.54L750 294.46L760 311.27L770 264.28L780 330.5L790 275.41L800 232.56L810 261.93L820 254.9L830 246.8L840 265.62L850 226.41L860 210.32L870 209.68L880 206.86L890 192.05L900 256.73L910 248.38L920 299.58L930 235.61L940 187.9L950 168.77L960 205.1L970 200.31L980 145.88L990 170.08L1000 203.65L1010 242.57L1020 266.52L1030 317.27L1040 345.77L1050 310.23L1060 372.12L1070 438.43L1080 495.78L1090 511.88L1100 495.13L1110 525.65L1120 544.73L1130 558.96L1140 496.28L1150 427.03L1160 410.09L1170 454.14L1180 448.18L1190 450.18L1200 474.68L1210 465.87L1220 529.43L1230 506.41L1240 494.41L1250 556.41L1260 490.35L1270 536.53L1280 469.86L1290 501.13L1300 454.11L1310 434.25L1320 451.55L1330 469.51L1340 483.47L1350 458.02L1360 440.6L1370 399.92L1380 424.23L1390 440.65L1400 384.09L1410 377.3L1420 370.5L1430 377.93L1440 327.32"
                                stroke-width="2"
                            ></path>
                            <path
                                d="M0 454.76L10 449.29L20 457.13L30 410.48L40 346.18L50 380.21L60 434.75L70 473.94L80 501.57L90 468.91L100 460.63L110 421.83L120 408.46L130 450.5L140 516.44L150 469.93L160 512.43L170 451.04L180 420.8L190 460.17L200 439.3L210 470.92L220 523.68L230 487.49L240 439.31L250 505.58L260 546.93L270 518.31L280 558.56L290 517.42L300 528.81L310 519.62L320 544.62L330 493.53L340 433.39L350 382.41L360 321.88L370 277.89L380 250.22L390 302.04L400 326.83L410 338.47L420 309.68L430 357.15L440 365.62L450 399.1L460 382.69L470 396.29L480 338.96L490 403.59L500 394.43L510 403.96L520 400.06L530 449.53L540 495.6L550 537.29L560 554.97L570 531.92L580 502.38L590 481.74L600 501.79L610 461.57L620 395.15L630 333.82L640 402.97L650 378.65L660 318.47L670 257.03L680 202.61L690 253.6L700 297.49L710 273.31L720 317.65L730 349.2L740 347.54L750 294.46L760 311.27L770 264.28L780 330.5L790 275.41L800 232.56L810 261.93L820 254.9L830 246.8L840 265.62L850 226.41L860 210.32L870 209.68L880 206.86L890 192.05L900 256.73L910 248.38L920 299.58L930 235.61L940 187.9L950 168.77L960 205.1L970 200.31L980 145.88L990 170.08L1000 203.65L1010 242.57L1020 266.52L1030 317.27L1040 345.77L1050 310.23L1060 372.12L1070 438.43L1080 495.78L1090 511.88L1100 495.13L1110 525.65L1120 544.73L1130 558.96L1140 496.28L1150 427.03L1160 410.09L1170 454.14L1180 448.18L1190 450.18L1200 474.68L1210 465.87L1220 529.43L1230 506.41L1240 494.41L1250 556.41L1260 490.35L1270 536.53L1280 469.86L1290 501.13L1300 454.11L1310 434.25L1320 451.55L1330 469.51L1340 483.47L1350 458.02L1360 440.6L1370 399.92L1380 424.23L1390 440.65L1400 384.09L1410 377.3L1420 370.5L1430 377.93L1440 327.32L1440 560L0 560z"
                                fill='//url("#SvgjsLinearGradient1051")'
                            ></path>
                        </g>
                        <defs>
                            <mask id="SvgjsMask1050">
                                <rect
                                    width="1440"
                                    height="560"
                                    fill="#ffffff"
                                ></rect>
                            </mask>
                            <linearGradient
                                x1="50%"
                                y1="0%"
                                x2="50%"
                                y2="100%"
                                id="SvgjsLinearGradient1051"
                            >
                                <stop
                                    stop-opacity="0.65"
                                    stop-color="rgba(87, 88, 99, 1)"
                                    offset="0"
                                ></stop>
                                <stop
                                    stop-opacity="0"
                                    stop-color="#aaabb4"
                                    offset="0.8"
                                ></stop>
                            </linearGradient>
                        </defs>
                    </svg>
                    <svg
                        className="absolute left-0 right-0 top-1/2 w-full min-w-[1440px] -translate-y-1/2 stroke-savesphere-600/50 stroke-4"
                        xmlns="http://www.w3.org/2000/svg"
                        version="1.1"
                        width="1440"
                        height="560"
                        preserveAspectRatio="none"
                        viewBox="0 0 1440 560"
                    >
                        <g mask='url("#SvgjsMask1032")' fill="none">
                            <path
                                d="M0 25.15L10 43.6L20 27.93L30 32.79L40 96.12L50 144.55L60 204.08L70 176.83L80 123.26L90 106.81L100 86.81L110 145.77L120 135.54L130 115.93L140 78.59L150 95.77L160 104.57L170 66.28L180 130.97L190 66.81L200 117.96L210 134.68L220 86.11L230 84.13L240 31.28L250 92.8L260 136.75L270 171.69L280 240.85L290 188.84L300 218.92L310 160.01L320 127.78L330 180.47L340 243.47L350 281.29L360 313.08L370 378.12L380 387.19L390 360.08L400 364.24L410 373.32L420 381.69L430 392.66L440 365.39L450 305.33L460 257.3L470 227.53L480 183.68L490 180.51L500 205.85L510 182.17L520 197.24L530 242.74L540 226.09L550 165.25L560 184.67L570 224.61L580 262.72L590 200.6L600 265.03L610 298.39L620 325.51L630 381.32L640 334.02L650 278.96L660 338.09L670 348.36L680 370.43L690 375.85L700 441.26L710 416.28L720 364.88L730 361.33L740 302.06L750 367.83L760 352.79L770 370.57L780 362.72L790 352.44L800 332.51L810 332.71L820 286.8L830 238.38L840 224.51L850 216.98L860 192L870 208.38L880 206.8L890 213.26L900 233.65L910 262.35L920 252.32L930 284.39L940 237.15L950 227.21L960 217.97L970 209.03L980 215.41L990 242.95L1000 192L1010 124.64L1020 177.07L1030 139.46L1040 101.87L1050 129.27L1060 114.48L1070 179.36L1080 217.07L1090 189.8L1100 257.51L1110 316.47L1120 258.53L1130 276.74L1140 248.86L1150 238.02L1160 172.1L1170 116.33L1180 185.99L1190 129.69L1200 183.96L1210 189.53L1220 185.23L1230 234.82L1240 181.14L1250 197.94L1260 216.5L1270 159.78L1280 203.15L1290 149.52L1300 213.57L1310 213.05L1320 274.39L1330 329.69L1340 319.33L1350 351.72L1360 388.58L1370 344.86L1380 288.83L1390 244.44L1400 235.84L1410 278.46L1420 268.34L1430 309.76L1440 253.44"
                                stroke-width="2"
                            ></path>
                            <path d="M0 25.15L10 43.6L20 27.93L30 32.79L40 96.12L50 144.55L60 204.08L70 176.83L80 123.26L90 106.81L100 86.81L110 145.77L120 135.54L130 115.93L140 78.59L150 95.77L160 104.57L170 66.28L180 130.97L190 66.81L200 117.96L210 134.68L220 86.11L230 84.13L240 31.28L250 92.8L260 136.75L270 171.69L280 240.85L290 188.84L300 218.92L310 160.01L320 127.78L330 180.47L340 243.47L350 281.29L360 313.08L370 378.12L380 387.19L390 360.08L400 364.24L410 373.32L420 381.69L430 392.66L440 365.39L450 305.33L460 257.3L470 227.53L480 183.68L490 180.51L500 205.85L510 182.17L520 197.24L530 242.74L540 226.09L550 165.25L560 184.67L570 224.61L580 262.72L590 200.6L600 265.03L610 298.39L620 325.51L630 381.32L640 334.02L650 278.96L660 338.09L670 348.36L680 370.43L690 375.85L700 441.26L710 416.28L720 364.88L730 361.33L740 302.06L750 367.83L760 352.79L770 370.57L780 362.72L790 352.44L800 332.51L810 332.71L820 286.8L830 238.38L840 224.51L850 216.98L860 192L870 208.38L880 206.8L890 213.26L900 233.65L910 262.35L920 252.32L930 284.39L940 237.15L950 227.21L960 217.97L970 209.03L980 215.41L990 242.95L1000 192L1010 124.64L1020 177.07L1030 139.46L1040 101.87L1050 129.27L1060 114.48L1070 179.36L1080 217.07L1090 189.8L1100 257.51L1110 316.47L1120 258.53L1130 276.74L1140 248.86L1150 238.02L1160 172.1L1170 116.33L1180 185.99L1190 129.69L1200 183.96L1210 189.53L1220 185.23L1230 234.82L1240 181.14L1250 197.94L1260 216.5L1270 159.78L1280 203.15L1290 149.52L1300 213.57L1310 213.05L1320 274.39L1330 329.69L1340 319.33L1350 351.72L1360 388.58L1370 344.86L1380 288.83L1390 244.44L1400 235.84L1410 278.46L1420 268.34L1430 309.76L1440 253.44L1440 560L0 560z"></path>
                        </g>
                        <defs>
                            <mask id="SvgjsMask1032">
                                <rect
                                    width="1440"
                                    height="560"
                                    fill="#ffffff"
                                ></rect>
                            </mask>
                            <linearGradient
                                x1="50%"
                                y1="0%"
                                x2="50%"
                                y2="100%"
                                id="SvgjsLinearGradient1033"
                            >
                                <stop
                                    stop-opacity="0.65"
                                    stop-color="rgba(87, 88, 99, 1)"
                                    offset="0"
                                ></stop>
                                <stop
                                    stop-opacity="0"
                                    stop-color="#aaabb4"
                                    offset="0.8"
                                ></stop>
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="z-10 flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-4 w-4 rounded-md bg-savesphere-950" />
                            <h2 className="font-montserrat text-2xl font-semibold text-savesphere-950">
                                Total balance
                            </h2>
                        </div>
                        <div className="flex gap-4">
                            <p className="text-5xl font-bold text-savesphere-800">
                                $1,000,000
                            </p>
                            <div className="flex items-center rounded-xl bg-green-300/50 p-2">
                                <span className="text-lg font-semibold text-green-500">
                                    +10%
                                </span>
                                <svg
                                    className="h-8 stroke-green-500"
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="44"
                                    height="44"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="#000000"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M3 17l6 -6l4 4l8 -8" />
                                    <path d="M14 7l7 0l0 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
