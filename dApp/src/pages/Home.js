import React, { useEffect, useState} from 'react';
import Button from "../components/Button";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { StyledContainer, StyledImage, StyledParagraph } from "../components/styles/Elements.style";

import { useTheme } from 'styled-components';

import { fetchBadgeData } from "../redux/badgeData/badgeDataActions";
import { fetchItemsData } from "../redux/itemsData/itemsDataActions";
import { fetchCollectionData } from "../redux/cyber9Data/cyber9DataActions";

import BG from "../components/images/BG.jpg";
import BG2 from "../components/images/BG2.jpg";
import dragonImg from "../components/images/dragon_logo.png";
import exchangeBadge from "../components/images/exchangeBadge.jpg";
import roadmap from "../components/images/roadmap.jpg";

const Home = () => {
    const dispatch = useDispatch();
    const blockchain = useSelector((state) => state.blockchain);
    const badgeData = useSelector((state) => state.badgeData);
    const collectionData = useSelector((state) => state.cyber9Data);
    // const itemsData = useSelector((state) => state.itemsData);
    const [claimingBadge, setclaimingBadge] = useState(false);
    const [claimingCollection, setClaimingCollection] = useState(false);

    //BADGE 
    const [badgeMintAmount, setBadgeMintAmount] = useState(1);

    const [mintAmount, setMintAmount] = useState(1);
    const [gasPrice, setGasPrice] = useState(null);
    const [gasLimit, setGasLimit] = useState(null);

    useEffect(() => {
        dispatch(fetchBadgeData(blockchain.account));
        dispatch(fetchItemsData(blockchain.account)); 
        dispatch(fetchCollectionData(blockchain.account));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockchain.account]);

    // mint artifact
    const claimBadge = (_amount) => {
        if (_amount <= 0) {
            return;
        }
        setclaimingBadge(true);
        //get gas estimations
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        badgeData.smartContract.methods.mint(_amount).estimateGas().then((res) =>{
            setGasLimit(res);
        });

        badgeData.smartContract.methods
            .mint(_amount)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: badgeData.smartContract.address,
                from: blockchain.account,
                value: blockchain.web3.utils.toWei(
                    ((Number(badgeData.cost) / 1e18) * _amount).toString(), "ether"),
            })
            .once('error', (err) => {
                console.log(err);
                setclaimingBadge(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setclaimingBadge(false);
                dispatch(fetchBadgeData(blockchain.account));
            });
    }

    // mint collection
    const claimCollection = (_amount) => {
        if (_amount <= 0) {
            return;
        }
        setClaimingCollection(true);
        //get gas estimations
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.mint(_amount).estimateGas().then((res) =>{
            setGasLimit(res);
        });
        
        collectionData.smartContract.methods
            .mint(_amount)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: collectionData.smartContract.address,
                from: blockchain.account,
                value: blockchain.web3.utils.toWei(
                    ((Number(collectionData.cost) / 1e18) * _amount).toString(), "ether"), //NEED TO CHANGE COST TO CONTRACTS DATA
            })
            .once('error', (err) => {
                console.log(err);
                setClaimingCollection(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setClaimingCollection(false);
                dispatch(fetchCollectionData(blockchain.account));
            });
    }

    const addMintAmount = () => {
        let newMintAmount = mintAmount + 1;
        if(newMintAmount > 10) newMintAmount = 10;
        setMintAmount(newMintAmount);
    }

    const subMintAmount = () => {
        let newMintAmount = mintAmount - 1;
        if(newMintAmount < 1) newMintAmount = 1;
        setMintAmount(newMintAmount);
    }

    const canMint = (isConnected) => {
        if(isConnected) { return false } else { return true };
    }
    

    
    //CSS 
    const theme = useTheme();

    //COUNTDOWN LOGIC
    const [timeleft, settimeleft] = useState("");
    let countDownDate = new Date("May 09, 2022 00:00:00").getTime();
    useEffect(() => {
        let timer = setInterval(() => {
            // Get today's date and time
            let now = new Date().getTime();

            //time till countdown ends in miliseconds
            let distance = countDownDate-now;
            
            // Time calculations for days, hours, minutes and seconds
            let days = Math.floor(distance / (1000 * 60 * 60 * 24));
            let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if(distance < 0 ){
                clearInterval(timer);
            }else{
                settimeleft(`${days > 1 ? `${days} days`: `${days} day`} ${hours > 1 ? `${hours} hours` : `${hours} hour`}
                ${minutes > 1 ? `${minutes} minutes` : `${minutes} minute`} ${seconds > 1 ? `${seconds} seconds` : `${seconds} second`}`);     
            }

        }, 1000);
    }, [timeleft, countDownDate]);

    //END COUNTDOWN

    return (
        <StyledContainer>
            <StyledContainer 
                //For background
                W={"100%"}
                H={"100vh"}
                minH={"600px"}
                gradient={
                `inset 0 0 10rem 6rem ${theme.colors.bodyBackground},
                inset 0 0 0 1rem ${theme.colors.bodyBackground}`
                }
                bgRepeat={"repeat"}
                bgSize={"30rem"}
                bgImg={BG}
                bgPos={"center"}

                position={"relative"}  
                display={"flex"}    

            >
                <StyledContainer margin={"auto"} position={"relative"}>
                    <StyledImage 
                        src={dragonImg} alt={"Dragon Badge"}
                        W={"55vw"}
                        H={"auto"} 
                        margin={"0 0 2% 0"} 
                        maxW={"80rem"}
                        //RESPONSIVE
                        laptopW={"75vw"}

                        tabletW={"90vw"}

                        mobileLW={"100vw"}
                    />
                    {/* TOTAL SUPPLY */}
                    <StyledParagraph margin={"0 0 3.5% 0"} size="1.3rem">
                        {(collectionData.loading && blockchain.connected) ? 'Loading smart contract...' : blockchain.connected ? `${collectionData.currentSupply}/${collectionData.totalSupply}` : ""}
                    </StyledParagraph>
                    <StyledContainer W={"20vw"} margin={"auto"} 
                        display={"flex"}  

                        //RESPONSIVE
                        laptopW={"22vw"}

                        tabletW={"28vw"}

                        MobileLW={"30vw"}
                    >
                        <Button text="-" onClick={() => {subMintAmount()}}
                            bgColor={theme.colors.activeBtnBG} W={"2.5vw"} H={"2.5vw"}
                            color={theme.colors.activeBtn}
                            size={"1.333rem"}

                            disabled={canMint(blockchain.connected) || claimingCollection || collectionData.loading}
                            bgDisabled={true}
                            colorDisabled={true}

                            //RESPONSIVE
                            laptopW = {"3.5vw"}
                            laptopH = {"3.5vw"}
                            
                            tabletW = {"4vw"}
                            tabletH = {"4vw"}
                        />
                        <Button text={`MINT ${mintAmount}`} W={"10vw"} H={"2.5vw"} bgColor={theme.colors.activeBtnBG} 
                            color={theme.colors.activeBtn} font={"Libre Baskerville, serif"}
                            
                            onClick={() => {claimCollection(mintAmount)}}

                            disabled={canMint(blockchain.connected) || claimingCollection || collectionData.loading}
                            bgDisabled={true}
                            colorDisabled={true}

                            //RESPONSIV
                            laptopW = {"12vw"}
                            laptopH = {"3.5vw"}

                            tabletW = {"15vw"}
                            tabletH = {"4vw"}
                        />
                        <Button text="+" onClick={() => {addMintAmount()}}
                            bgColor={theme.colors.activeBtnBG} W={"2.5vw"} H={"2.5vw"}
                            color={theme.colors.activeBtn}
                            size={"1.333rem"}

                            disabled={canMint(blockchain.connected) || claimingCollection || collectionData.loading}
                            bgDisabled={true}
                            colorDisabled={true}

                            //RESPONSIVE
                            laptopW = {"3.5vw"}
                            laptopH = {"3.5vw"}
                            
                            tabletW = {"4vw"}
                            tabletH = {"4vw"}
                        />
                    </StyledContainer>
                    
                    {/* COUNTDOWN */}
                    <StyledParagraph W={"100%"} whiteSpace={"normal"} margin={"3% 0 0 0"}
                        size={"1.6rem"} font={"Jaldi, sans-serif"}
                    >
                        {timeleft}
                    </StyledParagraph>

                </StyledContainer>
            </StyledContainer>

            <StyledContainer bgImg={BG2} bgPos={"center -10vh"} bgSize={"100%"}
            bgRepeat={"no-repeat"} 

            //RESPONSIVE
            laptopBgPos={"center -4%"}

            tabletBgPos={"center -8%"}
            >
                {/* BADGE EXCHANGE IMG */}

                <StyledContainer W={"65vw"} 
                    H={"65vh"} display={"flex"}
                    margin={"clamp(50px, 5vh, 100px) auto auto auto"}

                    //RESPONSIVE
                    laptopW={"70vw"}
                    laptopH={"100%"}
                    
                    tabletW={"80vw"}
                >
                    <StyledImage src={exchangeBadge} alt="Badge Exchange Example" 
                        W={"50%"} margin={"auto"} maxW={"50rem"}
                    />

                    <StyledContainer
                        margin={"auto auto auto 3%"}
                    >                    
                        <StyledParagraph font={"Libre Baskerville, serif"}
                            spacing={"0.5rem"} align={"left"} color={theme.colors.title}
                        >
                            BADGE REDEEMING
                        </StyledParagraph>
                        <br/><br/>
                        <StyledParagraph font={"Jaldi, sans-serif"}
                            align={"left"}
                        >
                            Owning a CYBER9 Badge allows its owner to mint a descendent from the <b>CYBER9</b> collection for free.
                            Furthermore, it is proof that you were an early adopter. These badges also cost half the mint price (<i>20 MATIC</i>)
                            than if you were to mint them from the CYBER9 collection. 
                            <br/>
                            Badges will be available for a limited time 
                            with a total supply of 2000. Each address is limited to minting a maximum of 5 badges. Make sure to get yours before they're gone! 
                        </StyledParagraph>
                        <br/><br/><br/>
                        <StyledContainer display={"flex"} alignItems={"start"}>
                            <Button text={`MINT BADGE`} W={"8vw"} H={"3vw"} bgColor={theme.colors.c9red} 
                                color={"white"} font={"Libre Baskerville, serif"} size={"0.7rem"} margin={"0"}
                                hoverColor={theme.colors.bodyText} spacing={"0.2rem"}
                                onClick={() => {claimBadge(badgeMintAmount)}}

                                disabled={canMint(blockchain.connected) || claimingBadge || badgeData.loading || badgeData.paused}
                                bgDisabled={true}
                                colorDisabled={true}

                                //RESPONSIVE
                                laptopW = {"10vw"}
                                laptopH = {"3.5vw"}
                                laptopFont = {"0.6rem"}

                                tabletW = {"13vw"}
                                tabletH = {"3.5vw"}
                                tabletFont = {"0.5rem"}
                            />
                        </StyledContainer>
                        <br/><br/><br/>
                        
                        {badgeData.ownerTokens < 1 ? (
                            <></>
                        ):(
                            <StyledContainer display={"flex"} alignItems={"start"} 
                                flexDirection={"column"} margin={"0"}
                            >
                                <StyledParagraph align={"left"} size="0.9rem">
                                    YOU CURRENTLY HAVE {badgeData.ownedTokens} BADGES
                                </StyledParagraph>
                                <br/>
                                <Link to="/Collection">
                                    <Button text="REDEEM NOW" W={"8vw"} H={"3vw"} bgColor={collectionData.loading ? "grey" : theme.colors.c9red}
                                        margin={"0"} hoverColor={collectionData.loading ? "" : theme.colors.bodyText} size={"0.7rem"} font={"Libre Baskerville, serif"}
                                        spacing={"0.2rem"}
                                        disabled={collectionData.loading ? true : false}
                                        onClick={() => {window.scrollTo(0,0)}} 

                                        //RESPONSIVE
                                        laptopW = {"10vw"}
                                        laptopH = {"3.5vw"}
                                        laptopFont = {"0.6rem"}

                                        tabletW = {"13vw"}
                                        tabletH = {"3.5vw"}
                                        tabletFont = {"0.5rem"} 
                                    >

                                    </Button>
                                </Link>
                            </StyledContainer>
                        )}
                        
                    </StyledContainer>

                </StyledContainer>

                {/* ORIGIN PART */}

                <StyledContainer W={theme.width.MainContent} H={"100%"}
                    margin={"10% auto 15% auto"} display={"flex"}
                    alignItems={"center"} justify={"center"}
                    flexDirection={"column"}

                    //RESPONSIVE
                    laptopW={theme.width.contentLaptop}
                    laptopMargin={"15% auto 20% auto"}

                    tabletW={theme.width.ContentTablet}
                    mobileLMargin={"20% auto 25% auto"}
                >
                    <StyledParagraph 
                        font={"Libre Baskerville, serif"}
                        spacing={"0.5rem"} align={"center"}
                        color={"white"}
                    >
                        ORIGIN
                    </StyledParagraph>
                    <br/><br/>
                    <StyledParagraph font={"Jaldi, sans-serif"}>
                        The year is 1680 ADK (After Dragon King), on a distant exoplanet, HD 173416-b, the Nine
                        sons of the dragon have formed an alliance known as <b>CYBER9</b>. The eldest son of each clan is 
                        leading a counterattack their arch enemy, the <i>DengLong</i> beasts. These creatures hunt and consume descendants 
                        of the Dragon King for the unique blood flowing through their veins.
                        <br/><br/>
                        After years of concealment, it is finally time to fight back. Although dangerous, various advancement in technology 
                        has allowed us to face these deadly foes. Each clan is now preparing to send out their best martial artists to the
                        front lines.
                        <br/><br/>
                        Come join us in the fight for our lineage in the world of <b>CYBER9</b>.
                        
                    </StyledParagraph>
                </StyledContainer>
                
                {/* ROADMAP */}
                <StyledContainer 
                    display={"flex"} justify={"center"}
                    alignItems={"center"} flexDirection={"column"}
                    margin={"0 auto"}
                >
                    <StyledParagraph 
                        font={"Libre Baskerville, serif"}
                        spacing={"0.5rem"} align={"center"} 
                        color={"white"}
                    >
                        ROADMAP
                    </StyledParagraph>
                    <br/><br/><br/>
                    {/* <StyledImage
                        src={roadmap} alt="Roadmap information"
                        bgPos={"center"} W={"45vw"}
                        margin={"5% auto"}
                    /> */}
                    <br/><br/>
                    <StyledContainer W={theme.width.MainContent}

                        //RESPONSIVE
                        laptopW={theme.width.contentLaptop}

                        tabletW={theme.width.ContentTablet}
                    >
                        <StyledParagraph align={"left"} font={"Jaldi, sans-serif"}>
                            <span style={{letterSpacing: '0.3rem'}}>AIRDROP</span>
                            <br/><br/>
                            Lucky Fortune Cats are fabled artifacts from ancient times. They are highly valuable and scarce. By simply possesssing one,
                            a CYBER9 badge will be bestowed upon its holder. Riches are sure to follow whomever carries one.
                            <br/>
                            Every Lucky Fortune Cat owner will be airdropped a CYBER9 badge for free on contract deployment.
                            Previous event winners will also receive their prizes during this period. Every Lucky Fortune Cat purchased after this airdrop will still be eligible 
                            to receive a CYBER9 badge for free.
                        <br/><br/><br/>
                        </StyledParagraph>
                        <StyledParagraph align={"left"} font={"Jaldi, sans-serif"}>
                            <span style={{letterSpacing: '0.3rem'}}>DISCORD</span>
                            <br/><br/>
                            The communications systems are now operational. The nine clans will now have a direct line of communication open between them for fast and effective
                            intelligence transmission. A key element for strategic planning and executing objectives.
                            <br/>
                            CYBER9's official discord community will go live. Numerous events will also be announcened on our socials, be sure to keep an 
                            eye out to not miss them. 
                            <br/><br/><br/>
                        </StyledParagraph>
                        <StyledParagraph align={"left"} font={"Jaldi, sans-serif"}>
                            <span style={{letterSpacing: '0.3rem'}}>WEBSITE</span>
                            <br/><br/>
                            The headquarters first build will be in service. This marks the end of the planning phase. 
                            Descendants will be making their final preperations before deployment. Extensive work will be done to expand 
                            and upgrade the headquarters infrastructure to accomodate large-scale operations.
                            <br/>
                            CYBER9's website will now be accessible. You will need a metamask wallet and have access to the Polygon network.
                            For more information on how to setup Polygon network(MATIC) for Metamask visit our discord or follow this link for the
                            official polygon documentation.
                            <br/><br/><br/>
                        </StyledParagraph>
                        <StyledParagraph align={"left"} font={"Jaldi, sans-serif"}>
                        <span style={{letterSpacing: '0.3rem'}}>PHASE 1</span>
                        <br/><br/>
                        CYBER9 Badge's will now be available to the public. The Dragon King has only made 2000 of them in his lifetime.
                        As supply is limited, each customer is constrained to a maximum of five badges. More can be acquired through events 
                        and challenges. Be alert of new updates and information for all the latest contest.
                        <br/>
                        Users will now be able to mint CYBER9 Badges from the website after connecting to their metamask wallet on the polygon network.
                        There is a maximum of five mints per address. Each badge will have a mint cost of 20 MATIC.
                        <br/><br/><br/>
                        </StyledParagraph>
                            <StyledParagraph align={"left"} font={"Jaldi, sans-serif"}>
                            <span style={{letterSpacing: '0.3rem'}}>FUTURE UPDATES</span>
                            <br/><br/>
                            Once phase 1 concludes, phase 2 will be set in motion. The nine clans will now be ready to send their best descendants 
                            to fight the beasts. The headquarters will be issuing $BEI tokens to all badge owners to support them in their war efforts.
                            Also, CYBER9 Badges will be able to be used to mint descendants from the CYBER9 collection. More details to come in the future!
                        </StyledParagraph>
                    </StyledContainer>
                    
                </StyledContainer>

            </StyledContainer>
            
        </StyledContainer>     
       
    ) 
}

export default Home;