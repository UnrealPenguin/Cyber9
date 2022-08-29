import { StyledContainer,StyledUl, StyledLi, StyledImage, StyledParagraph } from "./styles/Elements.style";
import { Link } from "react-router-dom";

import logo from "./images/logo.png";
import discord from "./images/discord.jpg";
import twitter from "./images/twitter.jpg";
import opensea from "./images/opensea.jpg";
import nftCalendar from "./images/nftCalendar.png"

const Footer = () => {

    return (
        <StyledContainer W={"100%"}
            margin={"clamp( 100px, 35vh , 250px) auto 0 auto"}
            borderTop={"1px solid #707070"}
        >
            <StyledContainer W={"100%"} margin={"3vh auto"}
                display={"flex"} alignItems={"center"}
                justify={"center"}
            >
                <StyledUl display={"flex"} alignItems={"center"} justify={"center"}>
                    <StyledLi padding={"8%"}>
                        <a href="https://twitter.com/CYBER9_NFT">
                            <StyledImage 
                                src={twitter} alt="Twitter"
                                W={"1.8vw"}
                                H={"auto"}
                            />
                        </a>
                    </StyledLi>
                    <StyledLi padding={"8%"}>
                        <a href="https://opensea.io/collection/cyber9-badge">
                            <StyledImage 
                                src={opensea} alt="Opensea"
                                W={"1.8vw"}
                                H={"auto"}
                            />
                        </a>
                    </StyledLi>
                    <StyledLi padding={"8%"}>
                        <a href="https://discord.gg/7C7BcCNwZu">
                            <StyledImage 
                                src={discord} alt="Discord"
                                W={"1.8vw"}
                                H={"auto"}
                            />
                        </a>
                    </StyledLi>
                    <StyledLi padding={"8%"}>
                        <a href="/#">
                            <StyledImage 
                                src={nftCalendar} alt="NFT Calendar"
                                W={"2.5vw"}
                                H={"auto"}
                            />
                        </a>
                    </StyledLi>

                </StyledUl>
            </StyledContainer>

            <StyledContainer 
                margin={'auto'}
            >
                <Link to="/">
                    <StyledImage 
                        src={logo} alt="Cyber9"
                        W={"4vw"}
                        H={"auto"}
                    />
                </Link>

                <StyledParagraph display={"flex"} alignItems={"center"}
                    justify={"center"} margin={"2.5vh 0 0 0"} spacing={"0.3rem"}
                    size={"0.7rem"} font={"Jaldi, sans-serif"}
                >
                    <a href="https://polygonscan.com/address/0xa0bed2e79eec0dd9aa3238d64541e59f134be003" target={"_blank"} rel="noreferrer">
                        BADGE CONTRACT
                    </a>
                </StyledParagraph>
                <StyledParagraph display={"flex"} alignItems={"center"}
                    justify={"center"} margin={"1vh 0 0 0"} spacing={"0.3rem"}
                    size={"0.7rem"} font={"Jaldi, sans-serif"}
                >
                    <a href="https://polygonscan.com/address/0x51566E70833487c0aDa5d30587f3f81efc8E8bf9#code" target={"_blank"} rel="noreferrer">
                        CYBER9 CONTRACT
                    </a>
                </StyledParagraph>

                <StyledParagraph display={"flex"} alignItems={"center"}
                    justify={"center"} H={"5vh"} spacing={"0.3rem"}
                    size={"0.7rem"}
                >
                    2022 CYBER9. ALL RIGHTS RESERVED.
                </StyledParagraph>
            </StyledContainer>

        </StyledContainer>
    )
}

export default Footer;