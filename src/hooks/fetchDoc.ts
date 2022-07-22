import * as tyron from 'tyron'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { useDispatch, useSelector } from 'react-redux'
import { updateDoc } from '../store/did-doc'
import { updateLoadingDoc } from '../store/loading'
import { DOMAINS } from '../../src/constants/domains'
import { UpdateResolvedInfo } from '../app/actions'
import { RootState } from '../app/reducers'
import { updateUser } from '../store/user'

function fetchDoc() {
    const zcrypto = tyron.Util.default.Zcrypto()
    const net = useSelector((state: RootState) => state.modal.net)
    const Router = useRouter()
    const dispatch = useDispatch()

    const fetch = async () => {
        updateLoadingDoc(true)
        const path = window.location.pathname
            .toLowerCase()
            .replace('/es', '')
            .replace('/cn', '')
            .replace('/id', '')
            .replace('/ru', '')
        const usernamePath = path.split('/')[1].split('.')[0]
        const domainPath = path.includes('.')
            ? path.split('/')[1].split('.')[1]
            : path.split('/')[2] === 'didx'
            ? 'did'
            : path.split('/')[2]
            ? path.split('/')[2]
            : 'did'
        const _username = usernamePath
        const _domain = domainPath
        await tyron.SearchBarUtil.default
            .fetchAddr(net, _username!, 'did')
            .then(async (addr) => {
                // alert(_username)
                // updateUser({name: _username, domain: _domain})
                let network = tyron.DidScheme.NetworkNamespace.Mainnet
                if (net === 'testnet') {
                    network = tyron.DidScheme.NetworkNamespace.Testnet
                }
                const init = new tyron.ZilliqaInit.default(network)
                let version = await init.API.blockchain
                    .getSmartContractSubState(addr, 'version')
                    .then((substate) => {
                        return substate.result.version as string
                    })
                    .catch(() => {
                        throw new Error('Version not supported.')
                    })
                version = version.slice(0, 7)
                if (
                    version === 'xwallet' ||
                    version === 'initi--' ||
                    version === '.stake-'
                ) {
                    await tyron.SearchBarUtil.default
                        .Resolve(net, addr)
                        .then(async (result: any) => {
                            const did_controller =
                                result.controller.toLowerCase()

                            updateDoc({
                                did: result.did,
                                version: result.version,
                                doc: result.doc,
                                dkms: result.dkms,
                                guardians: result.guardians,
                            })

                            updateLoadingDoc(false)

                            if (_domain === DOMAINS.DID) {
                                dispatch(
                                    UpdateResolvedInfo({
                                        addr: addr!,
                                        controller:
                                            zcrypto.toChecksumAddress(
                                                did_controller
                                            ),
                                        status: result.status,
                                    })
                                )
                            } else {
                                await tyron.SearchBarUtil.default
                                    .fetchAddr(net, _username!, _domain!)
                                    .then(async (domain_addr) => {
                                        dispatch(
                                            UpdateResolvedInfo({
                                                addr: domain_addr!,
                                                controller:
                                                    zcrypto.toChecksumAddress(
                                                        did_controller
                                                    ),
                                                status: result.status,
                                            })
                                        )
                                    })
                                    .catch(() => {
                                        toast.error(
                                            `Uninitialized DID Domain.`,
                                            {
                                                position: 'top-right',
                                                autoClose: 3000,
                                                hideProgressBar: false,
                                                closeOnClick: true,
                                                pauseOnHover: true,
                                                draggable: true,
                                                progress: undefined,
                                                theme: 'dark',
                                            }
                                        )
                                        Router.push(`/${_username}`)
                                    })
                            }
                        })
                        .catch((err) => {
                            throw err
                        })
                }
            })
            .catch((err) => {
                toast.error(String(err), {
                    position: 'top-right',
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'dark',
                })
                Router.push(`/`)
            })
    }

    return {
        fetch,
    }
}

export default fetchDoc
