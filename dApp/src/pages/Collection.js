import { useEffect, useState } from 'react';
import { StyledContainer } from "../components/styles/Elements.style";
import { useDispatch, useSelector  } from 'react-redux';
import Button from "../components/Button";
import { FcCheckmark } from 'react-icons/fc';

import { fetchCollectionData } from "../redux/cyber9Data/cyber9DataActions";

import { fetchItemsData } from "../redux/itemsData/itemsDataActions";

const Collection = () => {
    const dispatch = useDispatch();
    const blockchain = useSelector((state) => state.blockchain);
    const collectionData = useSelector((state) => state.cyber9Data);
    const itemsData = useSelector((state) => state.itemsData);

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
    
    useEffect(() => {
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

    const updateSelect = (_id, _descendentIDs) => { 
        //only enters once
        if(selectTriggerOnce) {            
            setTriggerOnce(false);
            setStakedSelection(collectionData.stakeArray[_id]);
        } 
        // if(collectionData.stakeArray[_id]===stakedSelection || initalState === false || initalState) {
        isSelected[_id].selected = !isSelected[_id].selected;
        updateSelection([...isSelected]);
     
        if(selectionArray.includes(_descendentIDs)){
            setSelectionArray(selectionArray.filter(selection => selection!==isSelected[_id].id));
        }else{
            setSelectionArray((prevValue) => [...prevValue, isSelected[_id].id]);
        }
        // }

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
            status = "On cooldown";
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

    return (
        <StyledContainer>
            <h1>USERS CYBER9 COLLECTION</h1>
            <Button text='Hunt DengLong' onClick={() => {
                scoutEnemy();
            }} disabled={spawning || collectionData.isSpawned || collectionData.loading || collectionData.usable === false} />
            <p>You currently have {collectionData.tokenBalance} $BEI</p>
            <p>You currently have {collectionData.storedBalance} $BEI stored</p>

            <StyledContainer>
                <p>INVENTORY</p>
                <p>You currently have {itemsData.orbBalance} Orbs</p>
                <p>You currently have {itemsData.hpBalance} Hp kit(s)</p>
                <p>You currently have {itemsData.cdBalance} Cooldown kit(s)</p>
                <p>You currently have {itemsData.statResetBalance} stat reset kit(s)</p>
            
            </StyledContainer>

            {collectionData.pastEvents && collectionData.pastEvents.slice(-5).map((data, i) => (
                <p key={data.Event + i} style={{whiteSpace: "pre-line", verticalAlign: "bottom"}}>
                    {checkEvents(data, i)}
                </p>
            ))}

            {<StyledContainer>
                <p style={c1Bonus > 0 ? {color:"black"} :{color:"white"}}>Grants all descendents {c1Bonus > 0 ? c1Bonus : 5} bonus damage</p>
                <p style={c2Bonus > 0 ? {color:"black"} :{color:"white"}}>Grants all descendents {c2Bonus > 0 ? c2Bonus : 10} bonus agility</p>
                <p style={c3Bonus > 0 ? {color:"black"} :{color:"white"}}>Grants all descendents {c3Bonus > 0 ? c3Bonus : 5} bonus dexterity</p>
                <p style={c4Bonus > 0 ? {color:"black"} :{color:"white"}}>Grants all descendents {c4Bonus > 0 ? c4Bonus : 5} bonus luck</p>
                <p style={c5Bonus > 0 ? {color:"black"} :{color:"white"}}>Grants all descendents {c5Bonus > 0 ? c5Bonus : 5} bonus intelligence</p>
                <p style={c6Bonus > 0 ? {color:"black"} :{color:"white"}}>Reduces all descendents received damage by {c6Bonus > 0 ? c6Bonus: 5}</p>
                <p style={c7Bonus > 0 ? {color:"black"} :{color:"white"}}>When spawning, reduces enemy's HP by {c7Bonus > 0 ? c7Bonus : 15}</p>
                <p style={c8Bonus > 0 ? {color:"black"} :{color:"white"}}>Grants {c8Bonus > 0 ? c8Bonus : 10} bonus BEI to staked descendents (Must restake to take effect)</p>
                <p style={c9Bonus > 0 ? {color:"black"} :{color:"white"}}>Grants {c9Bonus > 0 ? c9Bonus : 100} bonus experience when attacking an enemy</p>
            </StyledContainer>}
            {(collectionData.isSpawned) ? 
                <StyledContainer>
                    <p>Enemy Hp: {collectionData.enemyStats.hp} </p>
                    <p>Enemy Attack: {parseInt(collectionData.enemyStats.atk)} ~ {parseInt(collectionData.enemyStats.atk)*2}</p>             
                </StyledContainer> : ""} 

            <StyledContainer>
                {stakedSelection === false && 
                    <Button text="Stake" onClick={() => {
                        stake(selectionArray);
                    }} disabled={(canUse && usingNFT===false ? false : true) || collectionData.loading|| hasCD || collectionData.usable === false}/>
                }
                 {stakedSelection === false && 
                    <Button text="Attack" onClick={() => {
                        attackEnemy(selectionArray);
                    }} disabled={(canUse && usingNFT===false ? false : true) || collectionData.loading || collectionData.isSpawned===false || hasCD}/>
                }
                {stakedSelection === true && 
                    <Button text="Unstake" onClick={() => {
                        unstake(selectionArray);
                    }} disabled={(canUse && usingNFT===false ? false : true) || collectionData.loading}/>
                } 
                <Button text="Reset" onClick={() => {
                    deselect(collectionData.ownerTokens);
                }}/>

                <Button text="Withdraw Yield" onClick={() => {
                    withdrawYield();
                }} disabled={(canWithdraw && withdrawingYield===false? false : true) || collectionData.loading}/>
                
                <select onChange={(e) => setSort(e.target.value)}>
                    <option value="default">Default</option>
                    <option value="available">Available</option>
                    <option value="staked">Staked</option>
                    <option value="ascending">Ascending</option>
                    <option value="descending">Descending</option>
                </select>
            </StyledContainer>
                {(collectionData.loading === true) ? <p>loading...</p> : ""}
            <StyledContainer>
            <ul>             
                {collectionData.ownerTokens.map((data, i) => (
                    <li key={data}>
                    <StyledContainer onClick={() => {
                        updateSelect(i, data);
                    }} style={checkStatus(i) === 'Reviving' || checkStatus(i) === 'On Cooldown' ? {pointerEvents: "none"} : {pointerEvents: "auto"}}>
                        <p>Descendent #{data}</p>
                        {isSelected[i] && isSelected[i].selected && <FcCheckmark /> }
                        <img src={collectionData.imgArray[i]} alt={`Descendent #${data}`} style={{width: "150px",height: "150 px"}}></img>
                        <p>Status: {checkStatus(i)}</p>
                        {collectionData.totalYield[i].balance !== '0' ? <p>Current $BEI Yield: {collectionData.totalYield[i].balance}</p> : "" }
                        {collectionData.totalYield[i].experience !== '0' ? <p>Current EXP Yield: {collectionData.totalYield[i].experience}</p> : "" }
                        {collectionData.storedExp[i] !== '0' ? <p>Stored EXP : {collectionData.storedExp[i]} </p> : ""}
                        {collectionData.CD[i] !== '0' ? <p>Cooldown: {getTime(collectionData.CD[i])}</p> : ""}
                        <p>Level: {collectionData.characterStats[i].level}</p>
                        <p>Hp: {collectionData.characterStats[i].hp}/{collectionData.characterMaxHp[i]}</p>
                        <p>Attack: {parseInt(collectionData.characterStats[i].strength)*5} ~ {(parseInt(collectionData.characterStats[i].strength)*5)*2}</p>
                        <p>Strength: {collectionData.characterStats[i].strength}</p>
                        <p>Agility: {parseInt(collectionData.characterStats[i].agility) + (c2Bonus > 0 ? c2Bonus : 0)}</p>
                        <p>Dexterity: {parseInt(collectionData.characterStats[i].dexterity) + (c3Bonus > 0 ? c3Bonus : 0)}</p>
                        <p>Luck: {parseInt(collectionData.characterStats[i].luck) + (c4Bonus > 0 ? c4Bonus : 0)}</p>
                        <p>Intelligence: {parseInt(collectionData.characterStats[i].intelligence) + (c5Bonus > 0 ? c5Bonus : 0)}</p>                        
                        <p>{collectionData.characterStats[i].level === "50" ? "" : `Experience: ${collectionData.characterStats[i].experience}/${collectionData.expRequired[i]}`}</p>
                        <p>{enoughOrbs(collectionData.characterStats[i].level).orbsNeeded !== 0 ? `Orbs required: ${enoughOrbs(collectionData.characterStats[i].level).orbsNeeded}` : ""}</p>
                    </StyledContainer>
                        <Button text="Level up" onClick={() => {
                            levelUp(data, i);
                        }} disabled={checkStatus(i) === "Staked" || checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || parseInt(collectionData.characterStats[i].experience) < parseInt(collectionData.expRequired[i]) || enoughOrbs(collectionData.characterStats[i].level).disabled || collectionData.characterStats[i].level === "50"}/>
                        <Button text="heal" onClick={() => {
                            healCharacter(data);
                        }} disabled={checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || collectionData.characterMaxHp[i] === collectionData.characterStats[i].hp || hasItems("hp")}/>
                        <Button text="reset cooldown" onClick={() => {
                            resetCooldown(data);
                        }} disabled={checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || collectionData.CD[i] === '0' || hasItems("cd")}/>
                        {data > 9 ?
                            <Button text="Reroll stats" onClick={() => {
                                rerollStats(data);
                            }} disabled={checkStatus(i) === 'Reviving' || lvling || collectionData.loading || usingItem || collectionData.CD[i] !== '0' || collectionData.characterStats[i].hp === '0' || hasItems("statReset")}/>
                        : "" }
                        <br />
                        <br />
                    </li>     
                ))}
            </ul>
            </StyledContainer>
            <StyledContainer>
                <p>Store</p>
                <p>Orb</p>
                <img src={itemsData.orbUri} alt="Orb" style={{width: "150px",height: "150 px"}}></img>
                <Button text="-" onClick={() => {
                    subPurchaseAmount("orb");
                }}/>
                    {orbAmount} / {itemsData.orbPrice*orbAmount} $BEI 
                <Button text="+" onClick={() => {
                    addPurchaseAmount("orb");
                }}/>
                <Button text="Purchase Orb" onClick={() => {
                    purchaseOrbs(orbAmount);
                }} disabled={itemsData.loading || buyingItem || enoughBEI("orb")}/>

                <p>HP kit</p>
                <img src={itemsData.hpUri} alt="HP kit" style={{width: "150px",height: "150 px"}}></img>
                <Button text="-" onClick={() => {
                    subPurchaseAmount("hp");
                }}/>
                    {hpAmount} / {itemsData.hpKitPrice*hpAmount} $BEI
                <Button text="+" onClick={() => {
                    addPurchaseAmount("hp");
                }}/>
                <Button text="Purchase HP" onClick={() => {
                    purchaseHp(hpAmount);
                }} disabled={itemsData.loading || buyingItem || enoughBEI("hp")}/>

                <p>Cooldown reset</p>
                <img src={itemsData.cdUri} alt="Cd Kit" style={{width: "150px",height: "150 px"}}></img>
                <Button text="-" onClick={() => {
                    subPurchaseAmount("cd");
                }}/>
                    {cdAmount} / {itemsData.cdKitPrice*cdAmount} $BEI
                <Button text="+" onClick={() => {
                    addPurchaseAmount("cd");
                }}/>
                <Button text="Purchase cd reset" onClick={() => {
                    purchaseCd(cdAmount);
                }} disabled={itemsData.loading || buyingItem || enoughBEI("cd")}/>

                <p>Stat reset</p>
                <img src={itemsData.statResetUri} alt="Stat reset kit" style={{width: "150px",height: "150 px"}}></img>
                <Button text="-" onClick={() => {
                    subPurchaseAmount("statReset");
                }}/>
                    {statResetAmount} / {itemsData.statResetPrice*statResetAmount} $BEI
                <Button text="+" onClick={() => {
                    addPurchaseAmount("statReset");
                }}/>
                <Button text="Purchase stat reset" onClick={() => {
                    purchaseStatReset(statResetAmount);
                }} disabled={itemsData.loading || buyingItem || enoughBEI("statReset")}/>    
                
            </StyledContainer>
        </StyledContainer>
    
        
  
    )
}

export default Collection;