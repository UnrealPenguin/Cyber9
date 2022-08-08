import React from 'react';
import { useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { StyledContainer, StyledParagraph, StyledImage } from './styles/Elements.style';
import gsap from 'gsap';

import { useTheme } from 'styled-components';
import warning from "./images/warning.png";

const Error = () => {
    const blockchain = useSelector((state) => state.blockchain);

    const [error, setError] = useState();
    const [triggerOnce, settriggerOnce] = useState(true);
    const errorEl = useRef(null);

    const theme = useTheme();

    useEffect(() => {
        const tl = gsap.timeline({
            paused: true,
            defaults: {duration: 0.6}
        })
        .to(errorEl.current, {scale: 0})
        .to(errorEl.current, {scale: 1, backgroundColor : "rgba(134, 49, 53, 0.5)", opacity: 1, zIndex:2})
        .to(errorEl.current, {scale: 0, backgroundColor: "rgba(134, 49, 53, 0)", zIndex:0, delay: 2.5, onComplete:done});      

        //sets error only if there is one
        setError(blockchain.errorMsg);

        //prevents users from spamming the error
        if(triggerOnce && error!==undefined) {           
            settriggerOnce(false);
            tl.resume();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockchain.errorMsg]);

    //ERROR EFFECT   
    const done = () => {
        settriggerOnce(true);
    }
    
    return (
        <StyledContainer>            
            <StyledContainer W={"18.5vw"} H={"10vh"} bgColor={"rgba(134, 49, 53, 0)"} 
            position={"fixed"} top={"clamp(20px,8vh,40px)"} right={"1vw"}
            opacity={"0"} ref={errorEl} display={"flex"} borderBot={"5px solid " + theme.colors.c9red}
            minH ={"40px"} minW={"125px"} maxH ={"70px"}

            //RESPONSIVE
            laptopW={"30vw"} laptopH={"8vh"}

            tabletW={"35vw"} tabletH={"6vh"}
            
            mobileLW={"40vw"}
            >
                <StyledImage src={warning} opacity={"0.1"} alt="Warning" />

                <StyledParagraph margin={"auto"} W={"70%"}
                    position={"absolute"} top={"50%"} left={"50%"}
                    transform={"translate(-50%,-50%)"} select={"none"}
                >
                    {error}
                </StyledParagraph>    
            </StyledContainer>
        </StyledContainer>
    )
}

export default Error;