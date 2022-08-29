import { useDispatch, useSelector} from 'react-redux';
import { connect } from "../redux/blockchain/blockchainActions";
import { StyledContainer, StyledImage, StyledUl, StyledLi } from "./styles/Elements.style";
import { Link, useNavigate, useLocation} from "react-router-dom";
import Button from "./Button";
import { useEffect, useRef, useState } from 'react';

import { useTheme } from 'styled-components';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

import logo from "./images/logo.png";

gsap.registerPlugin(ScrollTrigger);

const Navbar = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const blockchain = useSelector((state) => state.blockchain);
    const collectionData = useSelector((state) => state.cyber9Data);
    const badgeData = useSelector((state) => state.badgeData);

    const [restricted, setRestricted] = useState(false); 
    useEffect(() => {
        collectionData.ownerTokens.length > 0 || badgeData.ownerTokens.length > 0 ? setRestricted(false) : setRestricted(true);
        
        if(!blockchain.connected || restricted) navigate("/");
        
    // eslint-disable-next-line react-hooks/exhaustive-deps    
    }, [blockchain.account, collectionData.ownerTokens, restricted]);

    //For navbar fade in/out
    const navEl = useRef(null);

    function convertRemToPixels(rem) {    
        return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
    }

    // register the effect with GSAP:

    useEffect(() => {
        const showAnim = gsap.from(navEl.current, { 
            yPercent: -100,
            paused: true,
            duration: 0.55
          }).progress(1);
          
        ScrollTrigger.create({
        start: convertRemToPixels(40), // start hiding menu after 40 rem
        end: 99999, 
        onUpdate: (self) => {
            self.direction === -1 ? showAnim.play() : showAnim.reverse();            
        }   
        });
    }, [])
  
    //CSS
    const theme = useTheme();

    return (
        <StyledContainer 
            W={"100%"}
            position={"fixed"}
            ref={navEl}
            margin={"auto"}
            top={"0"}
            left={"0"}

            index={"20"}
            bgColor={theme.colors.bodyBackground}
        >           
            <StyledContainer 
                W={theme.width.Nav}
                padding={"0.5% 0 0 0"}
                margin={"auto"}
                display={"flex"}
                alignItems={"center"}

                //RESPONSIVE   
                laptopW={theme.width.NavLaptop}

                tabletW={theme.width.NavTablet}

                mobileLW={theme.width.NavMobileL}
            >
                <StyledContainer>
                    <Link to="/" >
                            <StyledImage onClick={() => {window.scrollTo(0,0)}} 
                                src={logo} alt="Cyber9"
                                W={"3vw"}
                                H={"auto"}
                                minW={"25px"}
                            />
                    </Link>
                </StyledContainer>
                
                <StyledUl
                    display={"flex"}
                    mLeft={"auto"}
                >
                    <StyledLi>
                        <Link to="/">
                            <Button text="HOME" hoverColor={theme.colors.c9red} font={"Jaldi, sans-serif"}
                                color={location.pathname === "/" ? theme.colors.activeLink : ""}  
                                onClick={() => {window.scrollTo(0,0)}} 
                            />
                        </Link>
                    </StyledLi>
                    {/* FOR COLLECTION */}
                    <StyledLi margin={"0 1vw"}
                        //RESPONSIVE
                        marginLaptop={"0 1.5vw"}
                    >
                        <Link to="/Collection">
                            {location.pathname === "/Collection" ? (
                                <Button text="COLLECTION" font={"Jaldi, sans-serif"} 
                                    disabled={restricted || !blockchain.connected ? true : false}
                                    color={theme.colors.activeLink}
                                    hoverColor={restricted || !blockchain.connected ? "grey" : theme.colors.c9red}
                                />
                            ):(
                                <Button text="COLLECTION" font={"Jaldi, sans-serif"} 
                                    disabled={restricted || !blockchain.connected ? true : false}
                                    color={restricted || !blockchain.connected ? "grey" : ""}
                                    hoverColor={restricted || !blockchain.connected ? "grey" : theme.colors.c9red}
                                />
                            )}
                            
                        </Link>
                    </StyledLi>
                    
                    <StyledLi>
                        {!blockchain.connected ? (
                            <Button text="CONNECT" onClick={(e) => {
                                e.preventDefault();
                                dispatch(connect());                             
                            }} 
                                hoverColor={theme.colors.c9red}
                                font={"Jaldi, sans-serif"}
                            />
                        ) : (
                            <Button text="CONNECTED" disabled={true} 
                                color={"grey"} cursor={"auto"} 
                                font={"Jaldi, sans-serif"}
                            />
                        )}
                    </StyledLi>

                    
                </StyledUl>
            </StyledContainer>   
        </StyledContainer>
    )
}

export default Navbar
