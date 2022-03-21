import * as tyron from "tyron";
import * as zcrypto from "@zilliqa-js/crypto";
import { useStore } from "effector-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Donate } from "../../../..";
import { $contract } from "../../../../../src/store/contract";
import { $donation, updateDonation } from "../../../../../src/store/donation";
import { decryptKey, operationKeyPair } from "../../../../../src/lib/dkms";
import { $arconnect } from "../../../../../src/store/arconnect";
import { $doc } from "../../../../../src/store/did-doc";
import { $net } from "../../../../../src/store/wallet-network";
import { ZilPayBase } from "../../../../ZilPay/zilpay-base";
import { $user } from "../../../../../src/store/user";

function Component({ ids, patches }: { ids: string[], patches: tyron.DocumentModel.PatchModel[] }) {
  const username = useStore($user)?.name;
  const donation = useStore($donation);
  const contract = useStore($contract);
  const arConnect = useStore($arconnect);
  const dkms = useStore($doc)?.dkms;
  const net = useStore($net);

  const [txID, setTxID] = useState("");

  const handleSubmit = async () => {
    let key_input: Array<{ id: string }> = [];
    for (let i = 0; i < ids.length; i += 1) {
      key_input.push(
        {
          id: ids[i],
        },
      );
    }

    if (arConnect !== null && contract !== null && donation !== null) {
      try {
        const verification_methods: tyron.TyronZil.TransitionValue[] = [];
        const doc_elements: tyron.DocumentModel.DocumentElement[] = [];

        for (const input of key_input) {
          // Creates the cryptographic DID key pair
          const doc = await operationKeyPair({
            arConnect: arConnect,
            id: input.id,
            addr: contract.addr,
          });
          doc_elements.push(doc.element);
          verification_methods.push(doc.parameter);
        }

        const zilpay = new ZilPayBase();

        const patches_ = await tyron.Sidetree.Sidetree.processPatches(
          contract.addr,
          patches
        );
        const document = verification_methods.concat(patches_.updateDocument);
        const doc_elements_ = doc_elements.concat(patches_.documentElements);

        const hash = await tyron.DidCrud.default.HashDocument(doc_elements_);
        const encrypted_key = dkms.get("update");
        const private_key = await decryptKey(arConnect, encrypted_key);
        const public_key = zcrypto.getPubKeyFromPrivateKey(private_key);
        const signature = zcrypto.sign(
          Buffer.from(hash, "hex"),
          private_key,
          public_key
        );

        let tyron_: tyron.TyronZil.TransitionValue;
        const donation_ = String(donation * 1e12);
        switch (donation) {
          case 0:
            tyron_ = await tyron.TyronZil.default.OptionParam(
              tyron.TyronZil.Option.none,
              "Uint128"
            );
            break;
          default:
            tyron_ = await tyron.TyronZil.default.OptionParam(
              tyron.TyronZil.Option.some,
              "Uint128",
              donation_
            );
            break;
        }

        const tx_params = await tyron.TyronZil.default.CrudParams(
          contract.addr,
          document,
          await tyron.TyronZil.default.OptionParam(
            tyron.TyronZil.Option.some,
            "ByStr64",
            "0x" + signature
          ),
          tyron_
        );
        toast.info(`You're about to submit a DID Update transaction. Confirm with your DID Controller wallet.`, {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });

        await zilpay.call({
          contractAddress: contract.addr,
          transition: "DidUpdate",
          params: tx_params as unknown as Record<string, unknown>[],
          amount: String(donation)
        })
          .then((res) => {
            /**
             * @todo display secondary modal for transactions status with spinner until res gets confirmed. Then for the tx, display its ID (**)
             * position of the modal: bottom right
             * idem submit create, update and every other tx
             */
            setTxID(res.ID);
            updateDonation(null);
            window.open(
              `https://viewblock.io/zilliqa/tx/${res.ID}?network=${net}`
            );
            toast.info(`Wait for the transaction to get confirmed, and then access ${username}/did to see the changes.`, {
              position: "top-center",
              autoClose: 6000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'dark',
            })
            /** @todo redirect to username/did */
          })
          .catch(error => { throw error })
      } catch (error) {
        toast.error(`${error}`, {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'dark',
        });
      }
    }
  };

  return (
    <div>
      {
        txID === '' &&
        <Donate />
      }
      {donation !== null && (
        <div style={{ marginTop: '14%', textAlign: 'center' }}>
          <button
            type="button"
            className="button"
            onClick={handleSubmit}
          >
            <strong style={{ color: '#ffff32' }}>update did</strong>
          </button>
        </div>
      )}

      {/**
       * @todo ** move to tx display modal
       */}
      {txID !== '' && (
        <h5 style={{ marginTop: '10%' }}>
          Transaction ID:{" "}
          <a
            href={`https://viewblock.io/zilliqa/tx/${txID}?network=${net}`}
            rel="noreferrer"
            target="_blank"
          >
            {txID.slice(0, 22)}...
          </a>
        </h5>
      )}
    </div>
  );
}

export default Component;
