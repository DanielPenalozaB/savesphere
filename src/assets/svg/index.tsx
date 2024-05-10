import { SVGAttributes } from 'react';

export function BellIcon({ ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            stroke="#000000"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" />
            <path d="M9 17v1a3 3 0 0 0 6 0v-1" />
        </svg>
    );
}

export function PlusIcon({ ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#000000"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 5l0 14" />
            <path d="M5 12l14 0" />
        </svg>
    );
}

export function GridDotsIcon({ ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#000000"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M19 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M5 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M19 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        </svg>
    );
}

export function ChevronDownIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            {...props}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
        </svg>
    );
}

export function ArrowBarLeftIcon({ ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#000000"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M4 12l10 0" />
            <path d="M4 12l4 4" />
            <path d="M4 12l4 -4" />
            <path d="M20 4l0 16" />
        </svg>
    );
}

export function UserSquareRoundedIcon({ ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#000000"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 13a3 3 0 1 0 0 -6a3 3 0 0 0 0 6z" />
            <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9 -9 9s-9 -1.8 -9 -9s1.8 -9 9 -9z" />
            <path d="M6 20.05v-.05a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v.05" />
        </svg>
    );
}

export function DotsIcon({ ...props }) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="44"
            height="44"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#000000"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
            <path d="M19 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
        </svg>
    );
}

export function HomeIcon({ ...restProps }) {
    return (
        <svg
            {...restProps}
            xmlns="http://www.w3.org/2000/svg"
            id="Outline"
            viewBox="0 0 24 24"
            width="512"
            height="512"
        >
            <path d="M23.121,9.069,15.536,1.483a5.008,5.008,0,0,0-7.072,0L.879,9.069A2.978,2.978,0,0,0,0,11.19v9.817a3,3,0,0,0,3,3H21a3,3,0,0,0,3-3V11.19A2.978,2.978,0,0,0,23.121,9.069ZM15,22.007H9V18.073a3,3,0,0,1,6,0Zm7-1a1,1,0,0,1-1,1H17V18.073a5,5,0,0,0-10,0v3.934H3a1,1,0,0,1-1-1V11.19a1.008,1.008,0,0,1,.293-.707L9.878,2.9a3.008,3.008,0,0,1,4.244,0l7.585,7.586A1.008,1.008,0,0,1,22,11.19Z" />
        </svg>
    );
}

export function CardIcon({ ...restProps }) {
    return (
        <svg
            {...restProps}
            xmlns="http://www.w3.org/2000/svg"
            id="Outline"
            viewBox="0 0 24 24"
            width="512"
            height="512"
        >
            <circle cx="5.5" cy="15.5" r="1.5" />
            <path d="M19,3H5A5.006,5.006,0,0,0,0,8v8a5.006,5.006,0,0,0,5,5H19a5.006,5.006,0,0,0,5-5V8A5.006,5.006,0,0,0,19,3ZM5,5H19a3,3,0,0,1,3,3H2A3,3,0,0,1,5,5ZM19,19H5a3,3,0,0,1-3-3V10H22v6A3,3,0,0,1,19,19Z" />
        </svg>
    );
}

export function SortIcon({ ...restProps }) {
    return (
        <svg
            {...restProps}
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            data-name="Layer 1"
            viewBox="0 0 24 24"
            width="512"
            height="512"
        >
            <path d="M11.293,17.707l-3.293,3.293V1c0-.553-.447-1-1-1s-1,.447-1,1V21l-3.293-3.293c-.391-.391-1.023-.391-1.414,0s-.391,1.023,0,1.414l4.293,4.293c.39,.39,.902,.585,1.414,.585s1.024-.195,1.414-.585l4.293-4.293c.391-.391,.391-1.023,0-1.414s-1.023-.391-1.414,0ZM22.707,6.293c.391-.391,.391-1.023,0-1.414L18.414,.586C18.024,.196,17.512,0,17,0s-1.024,.195-1.414,.585l-4.293,4.293c-.391,.391-.391,1.023,0,1.414s1.023,.391,1.414,0l3.293-3.293V23c0,.553,.447,1,1,1s1-.447,1-1V3l3.293,3.293c.391,.391,1.023,.391,1.414,0Z" />
        </svg>
    );
}

export function TargetIcon({ ...restProps }) {
    return (
        <svg
            {...restProps}
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            data-name="Layer 1"
            viewBox="0 0 24 24"
            width="512"
            height="512"
        >
            <path d="M24,12c0,6.62-5.38,12-12,12S0,18.62,0,12,5.38,0,12,0c.73,0,1.47,.07,2.18,.2,.54,.1,.9,.62,.8,1.16-.1,.54-.62,.9-1.16,.8-.59-.11-1.21-.16-1.82-.16C6.49,2,2,6.49,2,12s4.49,10,10,10,10-4.49,10-10c0-.61-.06-1.22-.16-1.82-.1-.54,.26-1.06,.8-1.16,.55-.1,1.06,.26,1.16,.8,.13,.71,.2,1.45,.2,2.18ZM12.86,6.06c.55,.08,1.05-.3,1.13-.85s-.3-1.05-.85-1.13c-.38-.05-.76-.08-1.14-.08-4.41,0-8,3.59-8,8s3.59,8,8,8,8-3.59,8-8c0-.38-.03-.76-.08-1.14-.08-.55-.58-.93-1.13-.85-.55,.08-.93,.58-.85,1.13,.04,.28,.06,.57,.06,.86,0,3.31-2.69,6-6,6s-6-2.69-6-6,2.69-6,6-6c.29,0,.58,.02,.86,.06Zm-2.19,4.45c.41-.37,.45-1,.08-1.41-.37-.41-1-.45-1.41-.08-.85,.76-1.33,1.85-1.33,2.98,0,2.21,1.79,4,4,4,1.14,0,2.22-.49,2.98-1.33,.37-.41,.33-1.04-.08-1.41-.41-.37-1.04-.33-1.41,.08-.38,.42-.92,.67-1.49,.67-1.1,0-2-.9-2-2,0-.57,.24-1.11,.67-1.49Zm1.63-.22c-.39,.39-.39,1.02,0,1.41,.2,.2,.45,.29,.71,.29s.51-.1,.71-.29l4.71-4.71h2.59c.27,0,.52-.11,.71-.29l2-2c.29-.29,.37-.72,.22-1.09-.15-.37-.52-.62-.92-.62h-2V1c0-.4-.24-.77-.62-.92-.38-.16-.8-.07-1.09,.22l-2,2c-.19,.19-.29,.44-.29,.71v2.59l-4.71,4.71Z" />
        </svg>
    );
}

export function ReceiptIcon({ ...restProps }) {
    return (
        <svg
            {...restProps}
            xmlns="http://www.w3.org/2000/svg"
            id="Outline"
            viewBox="0 0 24 24"
            width="512"
            height="512"
        >
            <path d="M16,0H8A5.006,5.006,0,0,0,3,5V23a1,1,0,0,0,1.564.825L6.67,22.386l2.106,1.439a1,1,0,0,0,1.13,0l2.1-1.439,2.1,1.439a1,1,0,0,0,1.131,0l2.1-1.438,2.1,1.437A1,1,0,0,0,21,23V5A5.006,5.006,0,0,0,16,0Zm3,21.1-1.1-.752a1,1,0,0,0-1.132,0l-2.1,1.439-2.1-1.439a1,1,0,0,0-1.131,0l-2.1,1.439-2.1-1.439a1,1,0,0,0-1.129,0L5,21.1V5A3,3,0,0,1,8,2h8a3,3,0,0,1,3,3Z" />
            <rect x="7" y="8" width="10" height="2" rx="1" />
            <rect x="7" y="12" width="8" height="2" rx="1" />
        </svg>
    );
}

export function BellSchoolIcon({ ...restProps }) {
    return (
        <svg
            {...restProps}
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            height="512"
            viewBox="0 0 24 24"
            width="512"
            data-name="Layer 1"
        >
            <path d="m10 8a2 2 0 1 1 -2 2 2 2 0 0 1 2-2zm14 2a14.27 14.27 0 0 1 -11.484 13.952 2.95 2.95 0 0 1 -2.431-.646 3.013 3.013 0 0 1 -1.085-2.316v-1.041a10 10 0 1 1 9.382-15.394 1 1 0 1 1 -1.682 1.091 8 8 0 1 0 0 8.708 1 1 0 1 1 1.677 1.091 9.959 9.959 0 0 1 -7.377 4.492v1.053a1.016 1.016 0 0 0 .367.781.948.948 0 0 0 .791.213 12.192 12.192 0 0 0 9.47-9.053 2.955 2.955 0 0 1 -.628.069 3 3 0 1 1 3-3zm-2 0a1 1 0 1 0 -1 1 1 1 0 0 0 1-1z" />
        </svg>
    );
}

export function LogoutIcon({ ...restProps }) {
    return (
        <svg
            {...restProps}
            xmlns="http://www.w3.org/2000/svg"
            id="Layer_1"
            data-name="Layer 1"
            viewBox="0 0 24 24"
            width="512"
            height="512"
        >
            <path d="M11.476,15a1,1,0,0,0-1,1v3a3,3,0,0,1-3,3H5a3,3,0,0,1-3-3V5A3,3,0,0,1,5,2H7.476a3,3,0,0,1,3,3V8a1,1,0,0,0,2,0V5a5.006,5.006,0,0,0-5-5H5A5.006,5.006,0,0,0,0,5V19a5.006,5.006,0,0,0,5,5H7.476a5.006,5.006,0,0,0,5-5V16A1,1,0,0,0,11.476,15Z" />
            <path d="M22.867,9.879,18.281,5.293a1,1,0,1,0-1.414,1.414l4.262,4.263L6,11a1,1,0,0,0,0,2H6l15.188-.031-4.323,4.324a1,1,0,1,0,1.414,1.414l4.586-4.586A3,3,0,0,0,22.867,9.879Z" />
        </svg>
    );
}

export function BookmarkSquareIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            {...props}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9"
            />
        </svg>
    );
}
