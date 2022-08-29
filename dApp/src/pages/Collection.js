import { useEffect, useState, useRef } from 'react';
import { StyledContainer, StyledImage, StyledParagraph, StyledUl, StyledLi, StyledSelect } from "../components/styles/Elements.style";
import { useDispatch, useSelector } from 'react-redux';
import Button from "../components/Button";
import { useTheme } from 'styled-components';

import { fetchBadgeData } from "../redux/badgeData/badgeDataActions";
import { fetchCollectionData } from "../redux/cyber9Data/cyber9DataActions";
import { fetchItemsData } from "../redux/itemsData/itemsDataActions";

import { IoInformationCircleOutline } from "react-icons/io5";
import { BiReset } from "react-icons/bi";

const Collection = () => {
    const dispatch = useDispatch();
    const blockchain = useSelector((state) => state.blockchain);
    const collectionData = useSelector((state) => state.cyber9Data);
    const badgeData = useSelector((state) => state.badgeData);
    const itemsData = useSelector((state) => state.itemsData);
    const infoRef = useRef(null); 

    const [infoPosX, setInfoPosX] = useState(0);
    const [infoWidth, setInfoWidth] = useState(0);

    //selection logic
    const [isSelected, updateSelection] = useState([]);
    const [selectionArray, setSelectionArray] = useState([]);
    const [stakedSelection, setStakedSelection] = useState();
    const [selectTriggerOnce, setTriggerOnce ] = useState(true);

    const [canUse, setcanUse] = useState(false);
    const [usingNFT, setUsingNFT] = useState(false); //disable buttons if true

    //for gas estimations
    const [gasPrice, setGasPrice] = useState(null);
    const [gasLimit, setGasLimit] = useState(null);

    //withdraw 
    const [canWithdraw, setCanWithdraw] = useState(false);
    const [withdrawingYield, setWithdrawingYield] = useState(false);

    //leveling
    const [lvling, setLvling] = useState(false);

    //sort
    const [sort, setSort] = useState('default');

    //info box
    const [mouseOver, setMouseOver] = useState(false);

    //enenmy
    const [hasCD, setHasCD] = useState(false);
    const [spawning, setSpawning] = useState(false);

    //clan
    const [c1Bonus, setC1] = useState(0);
    const [c2Bonus, setC2] = useState(0);
    const [c3Bonus, setC3] = useState(0);
    const [c4Bonus, setC4] = useState(0);
    const [c5Bonus, setC5] = useState(0);
    const [c6Bonus, setC6] = useState(0);
    const [c7Bonus, setC7] = useState(0);
    const [c8Bonus, setC8] = useState(0);
    const [c9Bonus, setC9] = useState(0);

    //items
    const [orbAmount, setOrbAmount] = useState(1);
    const [hpAmount, setHpAmount] = useState(1);
    const [cdAmount, setCdAmount] = useState(1);
    const [statResetAmount, setStatResetAmount] = useState(1);
    const [buyingItem, setBuyingItem] = useState(false);
    const [usingItem, setUsingItem] = useState(false);


    //If the user changes account
    useEffect(() => {
        dispatch(fetchBadgeData(blockchain.account));
        dispatch(fetchCollectionData(blockchain.account));
        dispatch(fetchItemsData(blockchain.account));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [blockchain.account]);

    useEffect(() => {
        setCanWithdraw(checkBalance());

        //checks the yield every x minutes
        // const interval = setInterval(() => {
        //     dispatch(fetchCollectionData(blockchain.account, sort));
        //     setCanWithdraw(checkBalance());
        // }, 60000);
        // return () => clearInterval(interval);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionData.totalYield]);

    useEffect(() => {
        updateSelection([]);
        createSelect(collectionData.ownerTokens);
        checkBonuses(); //Checks which bonus is active whenever the token amount of the owner changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionData.ownerTokens.length]);

    useEffect(() => {
        selectionArray.length > 0 ? setcanUse(true) : setcanUse(false);
        if (selectionArray.length === 0) { setTriggerOnce(true); setStakedSelection(undefined)};
    }, [selectionArray]);

    useEffect(() => {
        const sortArray = type => {
            dispatch(fetchCollectionData(blockchain.account, type));
            if(selectionArray.length > 0 ) deselect(collectionData.ownerTokens);
        }
        sortArray(sort);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sort]);

    //SELECTION LOGIC
    const createSelect = (_ownedTokens) => {
        _ownedTokens.map((_ownedToken, index) => (
            updateSelection((prevValue) => [...prevValue, {id: _ownedTokens[index], selected:false }])
        ));
    }

    useEffect(() => {
        if (infoRef){
            setInfoPosX(infoRef.current.offsetLeft);
            setInfoWidth(infoRef.current.offsetWidth);
        }
    }, [mouseOver])

    const updateSelect = (_id, _descendentIDs, _status) => { 
        //only enters once
        if(selectTriggerOnce) {            
            setTriggerOnce(false);
            setStakedSelection(collectionData.stakeArray[_id]);
        } 
        isSelected[_id].selected = !isSelected[_id].selected;

        updateSelection([...isSelected]);

        if(selectionArray.includes(_descendentIDs)){
            setSelectionArray(selectionArray.filter(selection => selection!==isSelected[_id].id));
        }else{
            setSelectionArray((prevValue) => [...prevValue, isSelected[_id].id]);
        }

        ((collectionData.characterStats[_id].hp === '0' || parseInt(collectionData.CD[_id]) > 0) && isSelected[_id].selected) ? setHasCD(true) : setHasCD(false);
    }

    //Deselect everything if user cancels operation
    const deselect = (_ownedTokens) => {
        for(let i = 0; i<_ownedTokens.length;i++){
            isSelected[i].selected = false;
            updateSelection([...isSelected]);
        }
        setSelectionArray([]);
        setTriggerOnce(true);
    }

    //Checks if its on Cooldown, staked or available
    const checkStatus = (_index) => {
        let status;
        if(collectionData.characterStats[_index].hp === '0') {
            status = "Reviving";
        }else if(parseInt(collectionData.CD[_index]) > 0) {
            status = "On Cooldown";
        }else{
            (collectionData.stakeArray[_index] > 0) ? status="Staked" : status="Available";
        }
        return status;
    }

    //add CHECKS TO SEE IF THERES ANYTHING TO WITHDRAW
    const checkBalance = () => {
        let hasBalance;
        for(let i = 0; i<collectionData.totalYield.length;i++) {
            (collectionData.totalYield[i].balance > 0 || collectionData.storedBalance > 0) ? hasBalance=true : hasBalance=false;   
            if(hasBalance) return true; 
        }
        return false;
           
    }

    //FOR BADGE INTERACTION
    const checkBadgeUri = (_index) => {
        let url;
        // if(badgeData.freeMintCount[_index] === '0' && badgeData.revealed === true) { 
        //     url = badgeData.specialUri;
        // } else 
        if(badgeData.freeMintCount[_index] === '0') {
            url = badgeData.usedBadgeUri;
        } else {
            url = badgeData.badgeUri;
        } 
        return url;
    }

    const claimCollectionFree = (badgeId) => {
        //get gas estimations
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.freeMint(badgeId).estimateGas().then((res) =>{
            setGasLimit(res);
        });
        collectionData.smartContract.methods
        .freeMint(badgeId)
        .send({
            gasPrice: gasPrice,
            gasLimit: gasLimit,
            to: collectionData.smartContract.address,
            from: blockchain.account,
        })
        .once('error', (err) => {
            console.log(err);
        })
        .then((receipt) => {
            console.log(receipt);
            dispatch(fetchBadgeData(blockchain.account));
            dispatch(fetchCollectionData(blockchain.account));
        });
      
    }

    //CONTRACT INTERACTION FUNCTIONS
    const stake = (_descendentIDs) => {
        if (_descendentIDs.length <= 0) {
            return;
        }
        setUsingNFT(true);

        //get gas estimations
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.stake(_descendentIDs).estimateGas().then((res) =>{
            setGasLimit(res);
        });
        collectionData.smartContract.methods.stake(_descendentIDs)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: collectionData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setUsingNFT(false);
                setTriggerOnce(true);
                deselect(collectionData.ownerTokens);
            })
            .then((receipt) => {
                console.log(receipt);
                dispatch(fetchCollectionData(blockchain.account, sort));
                setUsingNFT(false);
                setTriggerOnce(true);
                deselect(collectionData.ownerTokens);
            });
    }

    const unstake = (_descendentIDs) => {
        if (_descendentIDs.length <= 0) {
            return;
        }
        setUsingNFT(true);
        //get gas estimations
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.unstake(_descendentIDs).estimateGas().then((res) =>{
            setGasLimit(res);
        });
        collectionData.smartContract.methods.unstake(_descendentIDs)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: collectionData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setUsingNFT(false);
                setTriggerOnce(true);
                deselect(collectionData.ownerTokens);
            })
            .then((receipt) => {
                console.log(receipt);
                dispatch(fetchCollectionData(blockchain.account, sort));
                setUsingNFT(false);
                setTriggerOnce(true);
                deselect(collectionData.ownerTokens);
            });
    }

    const levelUp = (_descendentID, _index) => {
        if (_descendentID.length <= 0) {
            return;
        }
        setLvling(true);
        //get gas estimations
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.levelUp(_descendentID).estimateGas().then((res) =>{
            setGasLimit(res);
        });
        collectionData.smartContract.methods.levelUp(_descendentID)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: collectionData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setLvling(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setLvling(false);
                dispatch(fetchCollectionData(blockchain.account, sort));
                if(collectionData.characterStats[_index].level % 10 === 9) {
                    dispatch(fetchItemsData(blockchain.account));
                }
            });
    }
 
    const healCharacter = (_descendentID) => {
        setUsingItem(true);
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.healCharacter(_descendentID).estimateGas().then((res) =>{
            setGasLimit(res);
        });
        collectionData.smartContract.methods.healCharacter(_descendentID)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: collectionData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setUsingItem(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setUsingItem(false);
                dispatch(fetchItemsData(blockchain.account));
                dispatch(fetchCollectionData(blockchain.account, sort));
            });
    }

    const resetCooldown = (_descendentID) => {
        setUsingItem(true);
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.healCharacter(_descendentID).estimateGas().then((res) =>{
            setGasLimit(res);
        });
        collectionData.smartContract.methods.healCharacter(_descendentID)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: collectionData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setUsingItem(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setUsingItem(false);
                dispatch(fetchItemsData(blockchain.account));
                dispatch(fetchCollectionData(blockchain.account, sort));
            });
    }

    const rerollStats = (_descendentID) => {
        setUsingItem(true);
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.resetStats(_descendentID).estimateGas().then((res) =>{
            setGasLimit(res);
        });
        collectionData.smartContract.methods.resetStats(_descendentID)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: collectionData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setUsingItem(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setUsingItem(false);
                dispatch(fetchItemsData(blockchain.account));
                dispatch(fetchCollectionData(blockchain.account, sort));
            });
    }

    const withdrawYield = () => {
        setWithdrawingYield(true);
        //get gas estimations
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.withdrawYield().estimateGas().then((res) =>{
            setGasLimit(res);
        });
        collectionData.smartContract.methods.withdrawYield()
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: collectionData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setWithdrawingYield(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setWithdrawingYield(false);
                setCanWithdraw(checkBalance());
                dispatch(fetchCollectionData(blockchain.account, sort));
            });
    }

    const scoutEnemy = () => {
        setSpawning(true);
        //get gas estimations
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.spawnEnemy().estimateGas().then((res) =>{
            setGasLimit(res);
        });
        collectionData.smartContract.methods.spawnEnemy()
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: collectionData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setSpawning(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setSpawning(false);
                dispatch(fetchCollectionData(blockchain.account, sort));
            });
    }

    const attackEnemy = (_descendentIDs) => {
        if (_descendentIDs.length <= 0) {
            return;
        }

        setUsingNFT(true);
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        collectionData.smartContract.methods.attackEnemy(_descendentIDs).estimateGas().then((res) =>{
            setGasLimit(res);
        });
        collectionData.smartContract.methods.attackEnemy(_descendentIDs)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: collectionData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setUsingNFT(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setUsingNFT(false);
                dispatch(fetchCollectionData(blockchain.account, sort));
                deselect(collectionData.ownerTokens);
            })
    }

    const checkBonuses = () => {
        let c1,c2,c3,c4,c5,c6,c7,c8,c9;
        c1 = c2 = c3 = c4 = c5 = c6 = c7 = c8 = c9 = 0;
        
        collectionData.ownerTokens.forEach(element => {
            element = parseInt(element);
            if((element > 9 && element < 1009) || element === 1) c1++;
            if((element > 1008 && element < 2007) || element === 2) c2++;
            if((element > 2006 && element < 3006) || element === 3) c3++;
            if((element > 3005 && element < 4005) || element === 4) c4++;
            if((element > 4004 && element < 5004) || element === 5) c5++;
            if((element > 5003 && element < 6003) || element === 6) c6++;
            if((element > 6002 && element < 7002) || element === 7) c7++;
            if((element > 7001 && element < 8001) || element === 8) c8++;
            if((element > 8000 && element < 9001) || element === 9) c9++;
        });
        let bonus = Math.floor(c1/3);
        if(bonus > 20) bonus = 20;
        setC1(bonus*5);

        bonus = Math.floor(c2/3);
        if(bonus > 40) bonus = 40;
        setC2(bonus*10);

        bonus = Math.floor(c3/3);
        if(bonus > 20) bonus = 20;
        setC3(bonus*5);

        bonus = Math.floor(c4/3);
        if(bonus > 20) bonus = 20;
        setC4(bonus*5);

        bonus = Math.floor(c5/3);
        if(bonus > 20) bonus = 20;
        setC5(bonus*5);

        bonus = Math.floor(c6/3);
        if(bonus > 20) bonus = 20;
        setC6(bonus*5);

        bonus = Math.floor(c7/3);
        if(bonus > 60) bonus = 60;
        setC7(bonus*15);

        bonus = Math.floor(c8/3);
        if(bonus > 40) bonus = 40;
        setC8(bonus*10);

        bonus = Math.floor(c9/3);
        if(bonus > 400) bonus = 400;
        setC9(bonus*100);
    }

    //converts seconds to hours and minutes
    const getTime = (_time) => {
        let sTime = parseInt(_time);
        let h = Math.floor(sTime / 3600);
        let m = Math.floor(sTime % 3600 / 60);
        let s = Math.floor(sTime % 3600 % 60);

        let hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
        let mDisplay = m > 0 ? m + (m === 1 ? " minute " : " minutes ") : "";
        let sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
        return hDisplay + mDisplay + sDisplay; 
    }

    //ITEMS FUNCTIONS
    const addPurchaseAmount = (_type) => {
        switch(_type) {
            case "orb":
                let newOrbAmount = orbAmount + 1;
                if(newOrbAmount > 10) newOrbAmount = 10;
                setOrbAmount(newOrbAmount);
                break;
            case "hp":
                let newHpAmount = hpAmount + 1;
                if(newHpAmount > 10) newHpAmount = 10;
                setHpAmount(newHpAmount);
                break;
            case "cd":
                let newCdAmount = cdAmount + 1;
                if(newCdAmount > 10) newCdAmount = 10;
                setCdAmount(newCdAmount);
                break;
            case "statReset":
                let newStatResetAmount = statResetAmount + 1;
                if(newStatResetAmount > 10) newStatResetAmount = 10;
                setStatResetAmount(newStatResetAmount);
                break;
            default:;
        }   
    }

    const subPurchaseAmount = (_type) => {
        switch(_type) {
            case "orb": 
                let newOrbAmount = orbAmount - 1;
                if(newOrbAmount < 1) newOrbAmount = 1;
                setOrbAmount(newOrbAmount);
                break;
            case "hp":
                let newHpAmount = hpAmount - 1;
                if(newHpAmount < 1) newHpAmount = 1;
                setHpAmount(newHpAmount);
                break;
            case "cd":
                let newCdAmount = cdAmount - 1;
                if(newCdAmount < 1) newCdAmount = 1;
                setCdAmount(newCdAmount);
                break;
            case "statReset":
                let newStatResetAmount = statResetAmount - 1;
                if(newStatResetAmount < 1) newStatResetAmount = 1;
                setStatResetAmount(newStatResetAmount);
                break;
            default:;       
        }
    }

    const enoughBEI = (_type) => {
        switch(_type) {
            case "orb":
                if(orbAmount*itemsData.orbPrice > collectionData.tokenBalance) return true;
                break;
            case "hp":
                if(hpAmount*itemsData.hpKitPrice > collectionData.tokenBalance) return true;
                break;
            case "cd":
                if(cdAmount*itemsData.cdKitPrice > collectionData.tokenBalance) return true;
                break;
            case "statReset":
                if(statResetAmount*itemsData.statResetPrice > collectionData.tokenBalance) return true;
                break;
            default:;
        }
    }

    const hasItems = (_type) => {
        switch(_type) {
            case "hp":
                if(itemsData.hpBalance === 0) return true;
                break;
            case "cd":
                if(itemsData.cdBalance === 0) return true;
                break;
            case "statReset":
                if(itemsData.statResetBalance === 0) return true;
                break;
            default:;
        }
    }

    const enoughOrbs = (_level) => {
        let disabled;
        let breakthroughNum;

        if(_level === "9") {
            breakthroughNum = 1;
        }else if(_level === "19") {
            breakthroughNum = 2;
        }else if(_level === "29") {
            breakthroughNum = 3;
        }else if(_level === "39") {
            breakthroughNum = 4;
        }else if(_level === "49") {
            breakthroughNum = 5;
        }else{
            breakthroughNum = 0;
        }
        itemsData.orbBalance >= breakthroughNum ? disabled = false : disabled = true;
        return {
            disabled: disabled,
            orbsNeeded: breakthroughNum
        }; 
    }

    const purchaseOrbs = (_amount) => {
        setBuyingItem(true);
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        itemsData.smartContract.methods.purchaseOrbs(blockchain.account, _amount).estimateGas().then((res) => {
            setGasLimit(res);
        });
        itemsData.smartContract.methods.purchaseOrbs(blockchain.account, _amount)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: itemsData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setBuyingItem(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setBuyingItem(false);
                dispatch(fetchItemsData(blockchain.account));
                dispatch(fetchCollectionData(blockchain.account, sort));
            })
    }

    const purchaseHp = (_amount) => {
        setBuyingItem(true);
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        itemsData.smartContract.methods.purchaseHpKit(blockchain.account, _amount).estimateGas().then((res) => {
            setGasLimit(res);
        });
        itemsData.smartContract.methods.purchaseHpKit(blockchain.account, _amount)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: itemsData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setBuyingItem(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setBuyingItem(false);
                dispatch(fetchItemsData(blockchain.account));
                dispatch(fetchCollectionData(blockchain.account, sort));
            })
    }

    const purchaseCd = (_amount) => {
        setBuyingItem(true);
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        itemsData.smartContract.methods.purchaseCdKit(blockchain.account, _amount).estimateGas().then((res) => {
            setGasLimit(res);
        });
        itemsData.smartContract.methods.purchaseCdKit(blockchain.account, _amount)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: itemsData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setBuyingItem(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setBuyingItem(false);
                dispatch(fetchItemsData(blockchain.account));
                dispatch(fetchCollectionData(blockchain.account, sort));
            })
    }

    const purchaseStatReset = (_amount) => {
        setBuyingItem(true);
        blockchain.web3.eth.getGasPrice().then((res) =>{
            setGasPrice(res);
        });
        itemsData.smartContract.methods.purchaseStatReset(blockchain.account, _amount).estimateGas().then((res) => {
            setGasLimit(res);
        });
        itemsData.smartContract.methods.purchaseStatReset(blockchain.account, _amount)
            .send({
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                to: itemsData.smartContract.address,
                from: blockchain.account,
            })
            .once('error', (err) => {
                console.log(err);
                setBuyingItem(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setBuyingItem(false);
                dispatch(fetchItemsData(blockchain.account));
                dispatch(fetchCollectionData(blockchain.account, sort));
            })
    }

    //EVENTS
    const checkEvents = (_data, _index) => {
        let tokens = "";
        
        switch(_data.Event) {
            case "Attack":
                return `Descendent #${_data.TokenId} (+${_data.Exp} EXP) has dealt a ${_data.Crit ? "critical hit": "normal hit"} to the DengLong beast for ${_data.DD} damage and received ${_data.DR} damage.`
            case "CharacterDefeated":
                return `Descendent #${_data.TokenId} has been defeated.`
            case "EnemyDefeated":
                return `Descendent #${_data.TokenId} has slain a Denglong beast and looted ${_data.BeiAmount} $BEI.`
            case "Staked":
                for(let i =0; i<_data.TokenId.length; i++) {
                    tokens += ("#" + _data.TokenId[i] + " "); 
                }
                return `Descendent ${tokens} has been staked.`
            case "Unstaked":
                for(let i =0; i<_data.TokenId.length; i++) {
                    tokens += ("#" + _data.TokenId[i] + " "); 
                }
                return `Descendent ${tokens} has been unstaked.`
            case "Withdraw":
                for(let i =0; i<_data.TokenId.length; i++) {
                    if(_data.TokenExp[i] > 0) {
                        tokens += `\nDescendent #${_data.TokenId[i]} has gained ${_data.TokenExp[i]} EXP. `;
                    }
                }
                return `You have withdrawn ${_data.BeiAmount} stored $BEI. ${tokens}`
            default:;
        }
    }

    //theme 
    const theme = useTheme();

    //For loading
    const loader = () => {
        if (collectionData.loading === true) {
            return (
                <>
                    <StyledContainer W={"100%"} H={"100%"} index={"9"} 
                        bgColor={"black"} position={"fixed"} top={"0"} left={"0"} opacity={"60%"}
                    />
                    <StyledContainer W={"3.5em"} H={"3.5em"} display={"flex"} position={"fixed"} top={"50%"} left={"50%"} border={`5px solid #4C4C4C`} borderTop={"5px solid #7C7C7C"}
                    borderRadius={"50%"} opacity={"100%"} index={"10"} anim={"rotate 1.2s linear infinite"}/>                    
                </>
            )   
        }
    }

    return (
        <StyledContainer margin={"8% auto 0 auto"} W={theme.width.Nav}>
            {loader()}
            {/* If user owns more than one badge */}
            {badgeData.ownerTokens.length> 0 ? (
                <StyledContainer bgColor={theme.colors.containerColor} padding={"2em"} 
                    maxW={"1300px"} margin={"0 auto 5% auto"}
                >
                    <StyledParagraph font={"Jaldi, sans-serif"} size={"1.5em"} align={"left"} margin={"0 0 3% 0"}>
                        BADGE COLLECTION
                    </StyledParagraph>
                    <StyledUl display={"flex"} flexWrap={"wrap"} justify={"space-around"}>
                        {badgeData.ownerTokens.map ((data, i) => (
                            <StyledContainer W={"30em"} H={"43em"}>
                                <StyledLi key={data}>
                                    <StyledParagraph size={"1.3em"} align={"left"} font={"Jaldi, sans-serif"}>Badge #{data}</StyledParagraph>
                                    <StyledImage src={checkBadgeUri(i)} alt={`Badge #${data}`} style={{width: "23em",height: "23em"}} margin={"5% 0"}/>
                                    {badgeData.freeMintCount[i] > 0 ? (
                                        <StyledParagraph font={"Jaldi, sans-serif"} align={"left"}>
                                            One of the 2000 mythical badges from the dragon king. Possessing one allows its owner to mint a descendent from the Cyber9 collection for free. It is said the dragon king infused his power into each badge. Acquire one before they vanish from this realm forever...
                                            <Button text="USE FREE MINT" margin={"2% 0"} size={"1.2em"} font={"Jaldi, sans-serif"} onClick={() => {claimCollectionFree(data)}}/>
                                        </StyledParagraph>
                                        
                                    ) : (
                                        <StyledParagraph font={"Jaldi, sans-serif"} align={"left"}>
                                            A broken badge from the dragon king, it has already been used to mint a descendent from the Cyber9 collection. Although it is shattered, a faint power is still emanating from the remnants. Perhaps this fragmented badge might still hold some value.    
                                        </StyledParagraph>
                                    )}
                                </StyledLi>
                            </StyledContainer>
                        ))}
                    </StyledUl>
                </StyledContainer>
            ):(
                <></>
            )}

            <StyledContainer display={"flex"} alignItems={"center"} maxW={"1300px"} margin={"0 auto 1% auto"}>
                <StyledParagraph size={"1.5em"}>
                    CYBER9 COLLECTION
                </StyledParagraph>
                <StyledContainer mLeft ={"auto"} onMouseLeave={() => {setMouseOver(false)}} > 
                    <StyledContainer margin={"10% 0 0 0"} ref={infoRef}>
                        <IoInformationCircleOutline style={{width: '100%', fontSize: '2.5em'}} onMouseOver={() => {setMouseOver(true)}} />
                    </StyledContainer>
                    {mouseOver ? (
                        <StyledContainer bgColor={"#666666"} position={"absolute"} index={"2"} 
                            W={"30em"} left={`calc(${infoPosX}px + ${infoWidth/2}px - 15.62em)`} arrow={true}

                            //RESPONSIVE
                            mobileLW={"20em"}
                            mobileLeft={`calc(${infoPosX}px + ${infoWidth/2}px - 11.30em)`}
                        >
                            <StyledContainer margin={"2em 3em"}>
                                <StyledParagraph size={"1.2em"} align={"left"}>Currency</StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"}>
                                    You currently have {collectionData.tokenBalance} $BEI<br/>
                                    You currently have {collectionData.storedBalance} $BEI stored
                                </StyledParagraph>
                                <Button text="WITHDRAW YIELD" onClick={() => { withdrawYield() }} size={"1.1em"}
                                    disabled={(canWithdraw && withdrawingYield===false? false : true) || collectionData.loading}
                                    font={"Jaldi, sans-serif"} color={(canWithdraw && withdrawingYield===false? false : true) || collectionData.loading ? "grey" : theme.colors.activeBtnBG}
                                />
                                <br/>
                                <StyledParagraph size={"1.2em"} align={"left"}>Inventory</StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"}>
                                    You currently have {itemsData.orbBalance} Orbs<br/>
                                    You currently have {itemsData.hpBalance} Hp kit(s)<br/>
                                    You currently have {itemsData.cdBalance} Cooldown kit(s)<br/>
                                    You currently have {itemsData.statResetBalance} stat reset kit(s)<br/>
                                </StyledParagraph>
                                <br />
                                <StyledParagraph size={"1.2em"} align={"left"}>Bonuses</StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"} decor={c1Bonus > 0 ? "" : "line-through"}>
                                    Grants all descendents {c1Bonus > 0 ? c1Bonus : 5} bonus damage
                                </StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"} decor={c2Bonus > 0 ? "" : "line-through"}>
                                    Grants all descendents {c2Bonus > 0 ? c2Bonus : 10} bonus agility
                                </StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"} decor={c3Bonus > 0 ? "" : "line-through"}>
                                    Grants all descendents {c3Bonus > 0 ? c3Bonus : 5} bonus dexterity
                                </StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"} decor={c4Bonus > 0 ? "" : "line-through"}>
                                    Grants all descendents {c4Bonus > 0 ? c4Bonus : 5} bonus luck
                                </StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"} decor={c5Bonus > 0 ? "" : "line-through"}>
                                    Grants all descendents {c5Bonus > 0 ? c5Bonus : 5} bonus intelligence
                                </StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"} decor={c6Bonus > 0 ? "" : "line-through"}>
                                    Reduces all descendents received damage by {c6Bonus > 0 ? c6Bonus: 5}
                                </StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"} decor={c7Bonus > 0 ? "" : "line-through"}>
                                    When spawning, reduces enemy's HP by {c7Bonus > 0 ? c7Bonus : 15}
                                </StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"} decor={c8Bonus > 0 ? "" : "line-through"}>
                                    Grants {c8Bonus > 0 ? c8Bonus : 10} bonus BEI to staked descendents (Must restake to take effect)
                                </StyledParagraph>
                                <StyledParagraph align={"left"} font={"Jaldi, sans-serif"} decor={c9Bonus > 0 ? "" : "line-through"}>
                                    Grants {c9Bonus > 0 ? c9Bonus : 100} bonus experience when attacking an enemy
                                </StyledParagraph>
                            </StyledContainer>
                        </StyledContainer>
                        ) : (
                        <></>
                    )}
                </StyledContainer>
            </StyledContainer>
            <StyledContainer display={"flex"} maxW={"1300px"} margin={"0 auto"}>
                <StyledContainer alignItems={"left"} margin={"auto 0"}> 
                    <StyledSelect bgColor={theme.colors.selected} 
                        onChange={(e) => setSort(e.target.value)}
                        H={"1.5em"} W={"110%"} color={theme.colors.bodyText}
                    >
                        <option value="default">Default</option>
                        <option value="available">Available</option>
                        <option value="staked">Staked</option>
                        <option value="ascending">Ascending</option>
                        <option value="descending">Descending</option>
                    </StyledSelect>
                </StyledContainer>
                <BiReset style={{fontSize: '2em', margin:"auto auto auto 2%", cursor: 'pointer'}} 
                    onClick={() => {deselect(collectionData.ownerTokens);}}
                    title={"Reset Selection"}
                />
                <StyledContainer mLeft={"auto"} margin={"auto 0 auto auto"} display={"flex"}>
                {stakedSelection === false && 
                    <Button text="Stake" onClick={() => { stake(selectionArray);}} size={"1.3em"}
                        disabled={(canUse && usingNFT===false ? false : true) || collectionData.loading|| hasCD || collectionData.usable === false}
                        font={"Jaldi, sans-serif"} hoverColor={((canUse && usingNFT===false ? false : true) || collectionData.loading|| hasCD || collectionData.usable === false) ? "" : theme.colors.c9red}
                        color={((canUse && usingNFT===false ? false : true) || collectionData.loading|| hasCD || collectionData.usable === false) ? "grey" : "white" }
                    />
                } 
                {stakedSelection === false && 
                    <Button text="Attack" onClick={() => { attackEnemy(selectionArray) }} margin={"0 0 0 0.5em"} size={"1.3em"}
                        disabled={(canUse && usingNFT===false ? false : true) || collectionData.loading || collectionData.isSpawned===false || hasCD}
                        font={"Jaldi, sans-serif"} hoverColor={((canUse && usingNFT===false ? false : true) || collectionData.loading || collectionData.isSpawned===false || hasCD) ? "" : theme.colors.c9red}
                        color={((canUse && usingNFT===false ? false : true) || collectionData.loading || collectionData.isSpawned===false || hasCD) ? "grey" : "white"}
                    />
                }
                {stakedSelection === true &&  
                    <Button text="Unstake" onClick={() => {unstake(selectionArray)}} margin={"0 0 0 0.5em"} size={"1.3em"}
                        disabled={(canUse && usingNFT===false ? false : true) || collectionData.loading}
                        font={"Jaldi, sans-serif"} hoverColor={((canUse && usingNFT===false ? false : true) || collectionData.loading) ? "" : theme.colors.c9red}
                        color={((canUse && usingNFT===false ? false : true) || collectionData.loading) ? "grey" : "white"}
                    />
                }        
                    <Button text='Hunt DengLong' onClick={() => { scoutEnemy() }} margin={"0 0 0 0.5em"} size={"1.3em"}
                        font={"Jaldi, sans-serif"} hoverColor={(spawning || collectionData.isSpawned || collectionData.loading || collectionData.usable === false) ? "" : theme.colors.c9red}
                        disabled={spawning || collectionData.isSpawned || collectionData.loading || collectionData.usable === false}
                        color={(spawning || collectionData.isSpawned || collectionData.loading || collectionData.usable === false) ? "grey" : "white"}
                     />
                
                </StyledContainer>
            </StyledContainer>

            <StyledContainer display={"flex"} maxW={"1300px"} margin={"1.5% auto 0 auto"} padding={"1% 0 0 0"} borderTop ={`0.5px ${theme.colors.bodyText} solid`}>
                <StyledContainer>
                    <StyledParagraph font={"Jaldi, sans-serif"} align={"left"} size={"1.3em"}> 
                        Descendants Log
                    </StyledParagraph>
                    <br/>
                    {collectionData.pastEvents && collectionData.pastEvents.slice(-5).map((data, i) => (
                        <StyledParagraph key={data.Event + i} style={{whiteSpace: "pre-line", verticalAlign: "bottom"}}
                        font={"Jaldi, sans-serif"} align={"left"}
                        >
                            {checkEvents(data, i)}
                        </StyledParagraph>
                    ))}
                </StyledContainer>
                <StyledContainer mLeft={"auto"}>
                    <StyledParagraph size={"1.3em"} align={"left"}>
                        Enemy DengLong
                    </StyledParagraph>
                    <br/>
                    {(collectionData.isSpawned) ? 
                        <StyledParagraph font={"Jaldi, sans-serif"} align={"left"}>
                            Enemy Hp: {collectionData.enemyStats.hp} <br/>
                            Enemy Attack: {parseInt(collectionData.enemyStats.atk)} ~ {parseInt(collectionData.enemyStats.atk)*2}
                        </StyledParagraph> 
                        : 
                        <StyledParagraph font={"Jaldi, sans-serif"} align={"left"}>
                           No active Deng Long at the moment.<br/>
                           Hunt a Deng Long to gain BEI and experience for your descendent.<br/>
                           Alternatively, you can send(stake) out your descendants to scout <br/> 
                           enemy territory for resources.
                        </StyledParagraph> 
                    } 
                </StyledContainer>
               
            </StyledContainer>
                     {/* box-shadow: inset 0 0 50px 1000px rgb(0 0 0 / 80%)
                opacity 50% to all other elements when it is unavailable.
            */}

            <StyledContainer maxW={"1400px"} margin={"0 auto"}>
                <StyledUl display={"flex"} flexWrap={"wrap"} justify={"space-around"}>             
                    {collectionData.ownerTokens.map((data, i) => (
                        <StyledContainer onClick={() => {
                            updateSelect(i, data, checkStatus(i));
                            }} style={(checkStatus(i) === 'Reviving' || checkStatus(i) === 'On Cooldown') ? {pointerEvents: "none"} : {pointerEvents: "auto"}}
                            margin={"3em 1em"} padding={"3em 3em"} bgColor={isSelected[i] && isSelected[i].selected ? theme.colors.selected : theme.colors.containerColor }
                            border={isSelected[i] && isSelected[i].selected  ? `1px ${theme.colors.selected} solid` : "1px #595959 solid"} cursor={"pointer"}
                            highlight={isSelected[i] && isSelected[i].selected ? `0 0 1.5em #70292d` : "0 0 1.5em #a6a6a6"} gradient={collectionData.CD[i] !== '0' ? "inset 0 0 0 100em rgb(10 10 10 / 50%)" : "" }
                        >

                            <StyledLi key={data}>
                                <StyledParagraph align={"left"} size={"1.3em"} font={"Jaldi, sans-serif" } opacity={collectionData.CD[i] !== '0' ? "50%" : ""}>Descendent #{data}</StyledParagraph>
                                <StyledImage src={collectionData.imgArray[i]} alt={`Descendent #${data}`} style={{width: "23em",height: "23em"}} 
                                    border={"2px #303030 solid"} opacity={collectionData.CD[i] !== '0' ? "50%" : ""}
                                />
                                <StyledParagraph align={"left"} lineHeight={"2em"} font={"Jaldi, sans-serif"} opacity={collectionData.CD[i] !== '0' ? "50%" : ""}>Status: {checkStatus(i)}<br/>
                                    {collectionData.totalYield[i].balance !== '0' ? `Current $BEI Yield: ${collectionData.totalYield[i].balance} \n` : "" }
                                    {collectionData.totalYield[i].experience !== '0' ? `Current EXP Yield: ${collectionData.totalYield[i].experience} \n` : "" }
                                    {collectionData.storedExp[i] !== '0' ? `Stored EXP : ${collectionData.storedExp[i]} \n` : ""}
                                    {collectionData.CD[i] !== '0' ? `Cooldown: ${getTime(collectionData.CD[i])} \n` : ""}
                                    Level: {collectionData.characterStats[i].level}<br/>
                                    Hp: {collectionData.characterStats[i].hp}/{collectionData.characterMaxHp[i]}<br/>
                                    Attack: {parseInt(collectionData.characterStats[i].strength)*5} ~ {(parseInt(collectionData.characterStats[i].strength)*5)*2}<br/>
                                    Strength: {collectionData.characterStats[i].strength}<br/>
                                    Agility: {parseInt(collectionData.characterStats[i].agility) + (c2Bonus > 0 ? c2Bonus : 0)}<br/>
                                    Dexterity: {parseInt(collectionData.characterStats[i].dexterity) + (c3Bonus > 0 ? c3Bonus : 0)}<br/>
                                    Luck: {parseInt(collectionData.characterStats[i].luck) + (c4Bonus > 0 ? c4Bonus : 0)}<br/>
                                    Intelligence: {parseInt(collectionData.characterStats[i].intelligence) + (c5Bonus > 0 ? c5Bonus : 0)}<br/>                        
                                    {collectionData.characterStats[i].level === "50" ? "" : `Experience: ${collectionData.characterStats[i].experience}/${collectionData.expRequired[i]}`}<br/>
                                    {enoughOrbs(collectionData.characterStats[i].level).orbsNeeded !== 0 ? `Orbs required: ${enoughOrbs(collectionData.characterStats[i].level).orbsNeeded}` : ""}<br/>
                                </StyledParagraph>
                                <Button text="Level Up" onClick={() => {
                                    levelUp(data, i);
                                }} disabled={checkStatus(i) === "Staked" || checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || parseInt(collectionData.characterStats[i].experience) < parseInt(collectionData.expRequired[i]) || enoughOrbs(collectionData.characterStats[i].level).disabled || collectionData.characterStats[i].level === "50"}
                                    color={(checkStatus(i) === "Staked" || checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || parseInt(collectionData.characterStats[i].experience) < parseInt(collectionData.expRequired[i]) || enoughOrbs(collectionData.characterStats[i].level).disabled || collectionData.characterStats[i].level === "50" || collectionData.CD[i] !== '0') ? "grey ": "white"}
                                    font={"Jaldi, sans-serif"} align={"left"} margin={"0"} 
                                />
                                <Button text="Heal" onClick={() => {
                                    healCharacter(data);
                                }} disabled={checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || collectionData.characterMaxHp[i] === collectionData.characterStats[i].hp || hasItems("hp")}
                                    color={(checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || collectionData.characterMaxHp[i] === collectionData.characterStats[i].hp || hasItems("hp")) ? "grey" : "white"}
                                    font={"Jaldi, sans-serif"} align={"left"} margin={"0"}
                                />
                                <Button text="Reset Cooldown" onClick={() => {
                                    resetCooldown(data);
                                }} disabled={checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || collectionData.CD[i] === '0' || hasItems("cd")}
                                    color={(checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || collectionData.CD[i] === '0' || hasItems("cd")) ? "grey" : "white"}
                                    font={"Jaldi, sans-serif"} align={"left"} margin={"0"} pEvent={(hasItems("cd") && collectionData.CD[i] === '0') ? "auto" : "none"}
                                />
                                {data > 9 ?
                                    <Button text="Reroll stats" onClick={() => {
                                        rerollStats(data);
                                    }} disabled={checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || collectionData.CD[i] !== '0' || collectionData.characterStats[i].hp === '0' || hasItems("statReset")}
                                       color={(checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || collectionData.CD[i] !== '0' || collectionData.characterStats[i].hp === '0' || hasItems("statReset")) ? "grey" : "white"}
                                        font={"Jaldi, sans-serif"} align={"left"} margin={"0"}
                                    />
                                : "" }
                            </StyledLi>   

                        </StyledContainer>
                    ))}
                </StyledUl>
            </StyledContainer>
 
            <StyledContainer maxW={"1000px"} margin={"0 auto"}>
                <StyledContainer display={"flex"} borderBot={`0.5px ${theme.colors.bodyText} solid`} padding={"0 0 2% 0"} margin={"5% 0"}>
                    <StyledParagraph size={"1.5em"} font={"Jaldi, sans-serif"}>Store</StyledParagraph>
                    <StyledParagraph size={"1.2em"} margin={"auto 0 auto auto"} font={"Jaldi, sans-serif"}>
                        You currently have {collectionData.tokenBalance} $BEI<br/>
                    </StyledParagraph>
                </StyledContainer>       
                <StyledContainer maxW={"950px"} margin={"0 auto"} display={"flex"} justify={"space-around"} flexWrap={"wrap"}>
                    <StyledContainer margin="2% auto">
                        <StyledParagraph size={"1.4em"} font={"Jaldi, sans-serif"} align={"left"}>Orb</StyledParagraph>
                        <StyledImage src={itemsData.orbUri} alt="Orb" style={{width: "23em",height: "23em"}} />
                        <StyledContainer display={"flex"} margin={"5% auto"}>
                            <Button text="-" onClick={() => { subPurchaseAmount("orb") }} 
                                bgColor={theme.colors.activeBtnBG} W={"1.3vw"} H={"1.3vw"}
                                color={theme.colors.activeBtn}
                                size={"1.333rem"} margin={"0 0 0 auto"}
                            />
                            <StyledParagraph margin={"0 5%"} font={"Jaldi, sans-serif"} size={"1.1em"}>{orbAmount} / {itemsData.orbPrice*orbAmount} $BEI</StyledParagraph>
                            <Button text="+" onClick={() => { addPurchaseAmount("orb") }}
                                bgColor={theme.colors.activeBtnBG} W={"1vw"} H={"1vw"}
                                color={theme.colors.activeBtn}
                                size={"1.333rem"} margin={"0 auto 0 0"}
                            />
                        </StyledContainer>
                        <Button text="Purchase Orb" onClick={() => { purchaseOrbs(orbAmount) }} 
                            font={"Jaldi, sans-serif"} margin={"0"}
                            disabled={itemsData.loading || buyingItem || enoughBEI("orb")} size={"1.2em"}
                            color={(itemsData.loading || buyingItem || enoughBEI("orb")) ? "grey": "white"}      
                        />
                    </StyledContainer>
                    <StyledContainer margin="2% auto">
                        <StyledParagraph size={"1.4em"} font={"Jaldi, sans-serif"} align={"left"}>HP kit</StyledParagraph>
                        <StyledImage src={itemsData.hpUri} alt="HP kit" style={{width: "23em",height: "23em"}}/>
                        <StyledContainer display={"flex"} margin={"5% auto"}>
                            <Button text="-" onClick={() => { subPurchaseAmount("hp") }}
                                bgColor={theme.colors.activeBtnBG} W={"1.3vw"} H={"1.3vw"}
                                color={theme.colors.activeBtn}
                                size={"1.333rem"} margin={"0 0 0 auto"}
                            />
                            <StyledParagraph margin={"0 5%"} font={"Jaldi, sans-serif"} size={"1.1em"}>{hpAmount} / {itemsData.hpKitPrice*hpAmount} $BEI </StyledParagraph> 
                            <Button text="+" onClick={() => { addPurchaseAmount("hp") }}
                                bgColor={theme.colors.activeBtnBG} W={"1.3vw"} H={"1.3vw"}
                                color={theme.colors.activeBtn}
                                size={"1.333rem"} margin={"0 auto 0 0"}
                            />
                        </StyledContainer>
                        <Button text="Purchase HP" onClick={() => { purchaseHp(hpAmount) }} 
                            font={"Jaldi, sans-serif"} margin={"0"}
                            disabled={itemsData.loading || buyingItem || enoughBEI("hp")} size={"1.2em"}
                            color={(itemsData.loading || buyingItem || enoughBEI("hp")) ? "grey" : "white"}
                        />
                    </StyledContainer>
                    <StyledContainer margin="2% auto">
                        <StyledParagraph size={"1.4em"} font={"Jaldi, sans-serif"} align={"left"}>Cooldown reset</StyledParagraph>
                        <StyledImage src={itemsData.cdUri} alt="Cd Kit" style={{width: "23em",height: "23em"}}/>
                        <StyledContainer display={"flex"} margin={"5% auto"}>
                            <Button text="-" onClick={() => { subPurchaseAmount("cd") }}
                                bgColor={theme.colors.activeBtnBG} W={"1.3vw"} H={"1.3vw"}
                                color={theme.colors.activeBtn}
                                size={"1.333rem"} margin={"0 0 0 auto"}
                            />
                            <StyledParagraph margin={"0 5%"} font={"Jaldi, sans-serif"} size={"1.1em"}>{cdAmount} / {itemsData.cdKitPrice*cdAmount} $BEI</StyledParagraph>
                            <Button text="+" onClick={() => { addPurchaseAmount("cd") }}
                                bgColor={theme.colors.activeBtnBG} W={"1.3vw"} H={"1.3vw"}
                                color={theme.colors.activeBtn}
                                size={"1.333rem"} margin={"0 auto 0 0"}
                            />
                        </StyledContainer>
                        <Button text="Purchase cd reset" onClick={() => { purchaseCd(cdAmount) }} 
                            font={"Jaldi, sans-serif"} margin={"0"}
                            disabled={itemsData.loading || buyingItem || enoughBEI("cd")} size={"1.2em"}
                            color={(itemsData.loading || buyingItem || enoughBEI("cd")) ? "grey" : "white"}
                        />
                    </StyledContainer>
                    <StyledContainer margin="2% auto">
                        <StyledParagraph size={"1.4em"} font={"Jaldi, sans-serif"} align={"left"}>Stat reset</StyledParagraph>
                        <StyledImage src={itemsData.statResetUri} alt="Stat reset kit" style={{width: "23em",height: "23em"}} />
                        <StyledContainer display={"flex"} margin={"5% auto"}>
                            <Button text="-" onClick={() => { subPurchaseAmount("statReset") }}
                                bgColor={theme.colors.activeBtnBG} W={"1.3vw"} H={"1.3vw"}
                                color={theme.colors.activeBtn}
                                size={"1.333rem"} margin={"0 0 0 auto"}
                            />
                            <StyledParagraph margin={"0 5%"} font={"Jaldi, sans-serif"} size={"1.1em"}>{statResetAmount} / {itemsData.statResetPrice*statResetAmount} $BEI</StyledParagraph> 
                            <Button text="+" onClick={() => { addPurchaseAmount("statReset") }}
                                bgColor={theme.colors.activeBtnBG} W={"1.3vw"} H={"1.3vw"}
                                color={theme.colors.activeBtn}
                                size={"1.333rem"} margin={"0 auto 0 0"}
                            />
                        </StyledContainer>
                        <Button text="Purchase stat reset" onClick={() => { purchaseStatReset(statResetAmount) }} 
                            font={"Jaldi, sans-serif"} margin={"0"}
                            disabled={itemsData.loading || buyingItem || enoughBEI("statReset")} size={"1.2em"}
                            color={(itemsData.loading || buyingItem || enoughBEI("statReset")) ? "grey" : "white"}
                        />    
                    </StyledContainer>
                </StyledContainer>
            </StyledContainer>
        </StyledContainer>
    
        
  
    )
}

export default Collection;