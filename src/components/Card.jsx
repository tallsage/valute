import React, { useEffect, useState } from 'react';
import axios from 'axios'
import { Autocomplete, Checkbox, FormGroup, FormControlLabel, TextField, Button } from '@mui/material';
import style from './Card.module.css'

function Card(props) {

    const [dataCurrName, setDataCurrName] = useState(undefined)
    const [dataCurrId, setDataCurrId] = useState(undefined)
    const [changeVal, setChangeVal] = useState('')
    const [click, setClick] = useState(0)
    const [mainCurr, setMainCurr] = useState(undefined)
    const [childCurrData, setChildCurrData] = useState([])
    const [render, setRender] = useState(false)
    const [endVal, setEndVal] = useState([])

    useEffect(() => {
        axios.get(`https://api.coinbase.com/v2/currencies`)
        .then(res => {
            setDataCurrName(res.data.data.map(el => {
                return el.name
            }))
            setDataCurrId(res.data.data.map(el => {
                return el.id
            }))
        })
      }, []);
 
      useEffect(() => {
        if (click !== 0) {
            axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=${mainCurr}`)
            .then(res => {
                let inf = childCurrData.map(el => {
                    return res.data.data.rates[el]
                })
                setEndVal(inf)
            })
            const timer = setTimeout(() => {
                setClick(click+1)
              }, 300000);
              return () => clearTimeout(timer);
        }
    }, [click]);

    const handleChackbox = (e) => {
        childCurrData.length === 0 ? 
            e.target.defaultValue === '1' ? setChildCurrData([undefined]) :
                e.target.defaultValue === '2' ? setChildCurrData([undefined, undefined]) : setChildCurrData([undefined, undefined, undefined]) 
        : setChildCurrData([])
    }

    const childCurr = () => {
        let childCurrArr = []
        for (let i = 0; i < childCurrData.length; i++) {
            childCurrArr.push(
                <Autocomplete
                    key={i}
                    style={{margin: '3px'}}
                    disablePortal
                    id={i}
                    options={dataCurrName}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} onBlur={handleAutocompleteChild} label="currency"/>}
                />
            )
        }
        return childCurrArr
    }

    const handleValue = (e) => {
        let value = e.nativeEvent.data === null ? e.nativeEvent.data : e.nativeEvent.data.replace(/[^\d.]/g, "")
        let newState = value === '' ? changeVal : value === null ? changeVal.slice(0, -1) : changeVal[changeVal.length-3] === '.' ? changeVal : changeVal + value
        setChangeVal(newState)
    }

    const handleButton = () => {
        setClick(click+1)
    }

    const handleAutocompleteMain = (e) => {
        setMainCurr(dataCurrId[dataCurrName.indexOf(e.target.value)])
    }

    const handleAutocompleteChild = (e) => {        
        let buff = childCurrData
        buff[e.target.id] = dataCurrId[dataCurrName.indexOf(e.target.value)]
        setChildCurrData(buff)
        render ? setRender(false) : setRender(true)
    }

    const endValue = () => {
        let endV = ['']
        for (let i = 0; i < endVal.length; i++) {
            let el = parseFloat(changeVal) * endVal[i]
            endV.push(
                <div className={style.childCurr}>
                    {mainCurr + ' to ' + childCurrData[i] + '  =>  ' + parseFloat(el).toFixed(2)}
                </div>
            )
        }
        return endV
    }

    return (
        <div className={style.main}>
            <div className={style.child}>
                ВЫБЕРИТЕ ВАЛЮТУ
            </div>
            <div className={style.child}>
                {dataCurrName && <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={dataCurrName}
                    sx={{ width: 300 }}
                    renderInput={(params) => <TextField {...params} onBlur={handleAutocompleteMain} label="currency"/>}
                />}
            </div>
            <div className={style.child}>
                ВЫБЕРИТЕ КОЛЛИЧЕСТВО ДОПОЛНИТЕЛЬНЫХ ВАЛЮТ
            </div>
            <div className={style.child}>
                <FormGroup row={true}>
                    <FormControlLabel 
                        disabled={
                            (childCurrData.length === 0) ?  false : (childCurrData.length === 1) ? false : true
                        } 
                        control={<Checkbox/>} label="1" value='1' 
                        onChange={handleChackbox}/>
                    <FormControlLabel 
                        disabled={
                            (childCurrData.length === 0) ?  false : (childCurrData.length === 2) ? false : true
                        } 
                        control={<Checkbox/>} label="2" value='2' 
                        onChange={handleChackbox}/>
                    <FormControlLabel 
                        disabled={
                            (childCurrData.length === 0) ?  false : (childCurrData.length === 3) ? false : true
                        } 
                        control={<Checkbox/>} label="3" value='3' 
                        onChange={handleChackbox}/>
                </FormGroup>
            </div>
            <div className={style.childCurr}>
                {childCurr()}
            </div>
            <div className={style.child}>
                ВВЕДИТЕ СУММУ
            </div>
            <div className={style.childCurr}>
                <TextField id="outlined-basic" label="quantity" variant="outlined" onChange={handleValue} value={changeVal}/>
            </div>
            <div className={style.childCurr}>
                {changeVal !== '' ?
                    mainCurr !== undefined ? 
                        childCurrData.length > 0 ? 
                        childCurrData.includes(undefined)? 
                            <Button variant="contained" disabled={true} onClick={handleButton}>СДЕЛАТЬ РАСЧЕТ</Button>  : 
                            <Button variant="contained" disabled={false} onClick={handleButton}>СДЕЛАТЬ РАСЧЕТ</Button>  : 
                        <Button variant="contained" disabled={true} onClick={handleButton}>СДЕЛАТЬ РАСЧЕТ</Button> :
                    <Button variant="contained" disabled={true} onClick={handleButton}>СДЕЛАТЬ РАСЧЕТ</Button> :
                <Button variant="contained" disabled={true} onClick={handleButton}>СДЕЛАТЬ РАСЧЕТ</Button>  
                }
            </div>
            {changeVal !== '' ?
                    mainCurr !== undefined ? 
                        childCurrData.length > 0 ? 
                        childCurrData.includes(undefined)? 
                            <></> : 
                            endValue()  : 
                            <></> :
                            <></> :
                            <></>  
                }
        </div>
    );
}

export default Card;