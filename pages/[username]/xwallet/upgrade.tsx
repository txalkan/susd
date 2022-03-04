import Layout from "../../../components/Layout";
import { DIDxWallet, Upgrade } from "../../../components";

function Header() {
  return (
    <>
      <Layout>
        <DIDxWallet>
          <Upgrade />
        </DIDxWallet>
      </Layout>
    </>
  );
}

export default Header;
