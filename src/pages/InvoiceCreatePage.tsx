import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import PageHeader from "@/components/shared/PageHeader";
import InvoiceCreateForm from "@/components/invoices/InvoiceCreateForm";

const InvoiceCreatePage = () => {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="فاتورة جديدة"
        subtitle="أنشئ فاتورة كشف أو جلسة أو بيع مباشر"
        action={
          <button className="btn-secondary" onClick={() => navigate("/invoices")}>
            <FiArrowRight size={16} /> رجوع للفواتير
          </button>
        }
      />
      <InvoiceCreateForm
        onSuccess={() => navigate("/invoices")}
        onCancel={() => navigate("/invoices")}
      />
    </div>
  );
};

export default InvoiceCreatePage;