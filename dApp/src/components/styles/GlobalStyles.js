import { createGlobalStyle  } from "styled-components";

//For responsive
const size = {
    mobileS: '320px',
    mobileM: '375px',
    mobileL: '425px',
    tablet: '768px',
    laptop: '1024px'
}

export const device = {
    mobileS: `(max-width: ${size.mobileS})`,
    mobileM: `(max-width: ${size.mobileM})`,
    mobileL: `(max-width: ${size.mobileL})`,
    tablet: `(max-width: ${size.tablet})`,
    laptop: `(max-width: ${size.laptop})`
}

const GlobalStyles = createGlobalStyle`   
    * {  
        margin : 0px;
        padding: 0px;
    }

    html {
        font-size: 14px; //100% = 16px

        @media ${device.laptop} {
            font-size: 0.85rem;
        }

        @media ${device.tablet} {
            font-size: 0.75rem;
        }

        @media ${device.mobileL} {
            font-size: 0.4rem;
        }
    }
    body {
       background-color: ${({ theme }) => theme.colors.bodyBackground};
       color: ${({ theme }) => theme.colors.bodyText};
    }

    li {
        list-style: none;
        display: inline-block;
    }

    a {
        text-decoration: none;
        color: ${({ theme }) => theme.colors.bodyText};

        &:hover{
            color: ${({ theme }) => theme.colors.c9red}
        }
    }

    p {
        min-height: 1rem;
    }

    //for loading animation
    @keyframes preloader {
        100% { transform: scale(1.5); }
    }

    @-webkit-keyframes rotate {
        from {-webkit-transform: rotate(0deg);}
        to {-webkit-transform: rotate(360deg);}
    }

    @-moz-keyframes rotate {
        from {-moz-transform: rotate(0deg);}
        to {-moz-transform: rotate(360deg);}
    }

    @keyframes rotate {
        from {transform: rotate(0deg);}
        to {transform: rotate(360deg);}
    }

`
export default GlobalStyles;

