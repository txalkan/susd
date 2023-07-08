import React, { useState, useEffect } from 'react'
import styles from './styles.module.scss'
import { updateDonation } from '../../src/store/donation'
import Image from 'next/image'
import icoDown from '../../src/assets/icons/ssi_icon_3arrowsDown.svg'
import icoUp from '../../src/assets/icons/ssi_icon_3arrowsUp.svg'
import icoDown2 from '../../src/assets/icons/ssi_icon_2arrowsDown.svg'
import icoUp2 from '../../src/assets/icons/ssi_icon_2arrowsUP.svg'
import icoReceive from '../../src/assets/icons/ssi_icon_receive.svg'
import icoDrop from '../../src/assets/icons/ssi_icon_drop.svg'
import icoZap from '../../src/assets/icons/ssi_icon_thunder.svg'
import icoFire from '../../src/assets/icons/ssi_icon_fire.svg'

import { useSelector } from 'react-redux'
import { RootState } from '../../src/app/reducers'
import CloseIcoReg from '../../src/assets/icons/ic_cross.svg'
import CloseIcoBlack from '../../src/assets/icons/ic_cross_black.svg'
import { SwapPair } from '../../src/types/swap'
import { SwapForm } from '../swap-form'
import { AddFunds, Balances, ClaimWallet, SBTxWALLET, ZILxWALLET } from '..'
import { PoolOverview } from '../pool'
import smartContract from '../../src/utils/smartContract'
import { useStore } from 'effector-react'
import { $resolvedInfo } from '../../src/store/resolvedInfo'
import * as tyron from 'tyron'
import fetch from '../../src/hooks/fetch'
import { $doc } from '../../src/store/did-doc'
import { $net } from '../../src/store/network'
type Prop = {
    startPair: SwapPair[]
}

export const Defix: React.FC<Prop> = ({ startPair }) => {
    const [active, setActive] = useState('')
    const isLight = useSelector((state: RootState) => state.modal.isLight)
    const CloseIco = isLight ? CloseIcoBlack : CloseIcoReg

    const toggleActive = (id: string) => {
        resetState()
        if (id === active) {
            setActive('')
        } else {
            setActive(id)
        }
    }
    const resetState = () => {
        updateDonation(null)
        // setLegend('CONTINUE')
        // setLegend2('CONTINUE')
        // setInput(0)
        // updateExtraZil(0)
        // setRecipient('')
        // setBeneficiaryTLD('default')
        // setBeneficiaryDomain('')
        // setBeneficiarySubdomain('')
        // setSsn('')
        // setSsn2('')
        // setCurrentD('')
        // setSearchInput('')
        // setShowZil(false)
    }

    const [activeAcc, setActiveAcc] = useState('')
    const toggleActiveAcc = (id: string) => {
        if (id === activeAcc) {
            setActiveAcc('')
        } else {
            setActiveAcc(id)
        }
    }

    const { fetchDoc } = fetch()
    const controller_ = useStore($doc)?.controller
    const resolvedInfo = useStore($resolvedInfo)
    const loggedInZilPay = useSelector(
        (state: RootState) => state.modal.zilAddr
    )
    const zilpay = loggedInZilPay?.base16
    const net = $net.state.net as 'mainnet' | 'testnet'

    useEffect(() => {
        if (!controller_) {
            fetchDoc()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resolvedInfo?.user_domain, net])

    return (
        <div className={styles.container}>
            {/* @dev: trade */}
            <div className={styles.cardActiveWrapper}>
                <div
                    onClick={() => toggleActive('trade')}
                    className={
                        active === 'trade' ? styles.cardActive : styles.card
                    }
                >
                    {/* @review: majin translates */}
                    <div className={styles.icoWrapper2}>
                        <Image src={icoZap} alt="trade-ico" />
                        <div className={styles.title}>trade</div>
                    </div>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'trade' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div>
                </div>
                {active === 'trade' && (
                    <div className={styles.cardSub}>
                        <div className={styles.closeIcoWrapper}>
                            <div
                                onClick={() => toggleActive('')}
                                className={styles.closeIco}
                            >
                                <Image
                                    width={10}
                                    src={CloseIco}
                                    alt="close-ico"
                                />
                            </div>
                        </div>
                        <div className={styles.wrapper}>
                            {/* @dev: SWAP */}
                            <SwapForm startPair={startPair} />
                        </div>
                    </div>
                )}
            </div>
            {/* @dev: DeFi account */}
            <div className={styles.cardActiveWrapper}>
                <div
                    onClick={() => toggleActive('account')}
                    className={
                        active === 'account' ? styles.cardActive : styles.card
                    }
                >
                    {/* @review: majin translates */}
                    <div className={styles.icoWrapper2}>
                        <Image src={icoFire} alt="fire-ico" />
                        <div className={styles.title}>defi account</div>
                    </div>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'account' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div>
                </div>
                {active === 'account' && (
                    <div className={styles.cardSub}>
                        <div className={styles.closeIcoWrapper}>
                            <div
                                onClick={() => toggleActive('')}
                                className={styles.closeIco}
                            >
                                <Image
                                    width={10}
                                    src={CloseIco}
                                    alt="close-ico"
                                />
                            </div>
                        </div>
                        <div className={styles.wrapper}>
                            {controller_ === zilpay ? (
                                <div className={styles.subWrapper}>
                                    <Balances />
                                </div>
                            ) : (
                                <div className={styles.subWrapper}>
                                    {/* @dev: deposits */}
                                    <div
                                        onClick={() =>
                                            toggleActiveAcc('receive')
                                        }
                                        className={
                                            activeAcc === 'receive'
                                                ? styles.cardActive2
                                                : styles.card2
                                        }
                                    >
                                        {/* @review: majin translates */}
                                        <div className={styles.icoWrapper2}>
                                            <Image
                                                src={icoReceive}
                                                alt="receive-ico"
                                            />
                                            <div className={styles.title2}>
                                                receive
                                            </div>
                                        </div>
                                        <div className={styles.icoWrapper}>
                                            <Image
                                                src={
                                                    activeAcc === 'receive'
                                                        ? icoUp2
                                                        : icoDown2
                                                }
                                                alt="toggle-ico"
                                            />
                                        </div>
                                    </div>
                                    {activeAcc === 'receive' && (
                                        <div className={styles.cardSub2}>
                                            <div
                                                className={
                                                    styles.closeIcoWrapper
                                                }
                                            >
                                                <div
                                                    onClick={() =>
                                                        toggleActiveAcc('')
                                                    }
                                                    className={styles.closeIco}
                                                >
                                                    <Image
                                                        width={10}
                                                        src={CloseIco}
                                                        alt="close-ico"
                                                    />
                                                </div>
                                            </div>
                                            <AddFunds type="funds" />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className={styles.subWrapper}>
                                <ClaimWallet title="CLAIM DEFIxWALLET" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* @dev: Soulbound tokens */}
            <div className={styles.cardActiveWrapper}>
                <div
                    onClick={() => toggleActive('sbt')}
                    className={
                        active === 'sbt' ? styles.cardActive : styles.card
                    }
                >
                    <div className={styles.icoWrapper2}>
                        <Image src={icoFire} alt="fire-ico" />
                        <div className={styles.title}>Soulbound</div>
                    </div>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'sbt' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div>
                </div>
                {active === 'sbt' && (
                    <div className={styles.cardSub}>
                        <div className={styles.closeIcoWrapper}>
                            <div
                                onClick={() => toggleActive('')}
                                className={styles.closeIco}
                            >
                                <Image
                                    width={10}
                                    src={CloseIco}
                                    alt="close-ico"
                                />
                            </div>
                        </div>
                        <div className={styles.wrapper}>
                            <SBTxWALLET type="public" />
                        </div>
                    </div>
                )}
            </div>
            {/* @dev: liquidity pools */}
            <div className={styles.cardActiveWrapper}>
                <div
                    onClick={() => toggleActive('pools')}
                    className={
                        active === 'pools' ? styles.cardActive : styles.card
                    }
                >
                    {/* @review: majin translates */}
                    <div className={styles.icoWrapper2}>
                        <Image src={icoDrop} alt="drop-ico" />
                        <div className={styles.title}>liquidity pools</div>
                    </div>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'pools' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div>
                </div>
                {active === 'pools' && (
                    <div className={styles.cardSub}>
                        <div className={styles.closeIcoWrapper}>
                            <div
                                onClick={() => toggleActive('')}
                                className={styles.closeIco}
                            >
                                <Image
                                    width={10}
                                    src={CloseIco}
                                    alt="close-ico"
                                />
                            </div>
                        </div>
                        <div className={styles.wrapper}>
                            <PoolOverview loading={false} />
                        </div>
                    </div>
                )}
            </div>
            {/* @dev: staking */}
            <div className={styles.cardActiveWrapper}>
                <div
                    onClick={() => toggleActive('stake')}
                    className={
                        active === 'stake' ? styles.cardActive : styles.card
                    }
                >
                    <div className={styles.icoWrapper2}>
                        <Image src={icoDrop} alt="drop-ico" />
                        <div className={styles.title}>staking</div>
                    </div>
                    <div className={styles.icoWrapper}>
                        <Image
                            src={active === 'stake' ? icoUp : icoDown}
                            alt="toggle-ico"
                        />
                    </div>
                </div>
                {active === 'stake' && (
                    <div className={styles.cardSub}>
                        <div className={styles.closeIcoWrapper}>
                            <div
                                onClick={() => toggleActive('')}
                                className={styles.closeIco}
                            >
                                <Image
                                    width={10}
                                    src={CloseIco}
                                    alt="close-ico"
                                />
                            </div>
                        </div>
                        <div className={styles.wrapper}>
                            <ZILxWALLET />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Defix
