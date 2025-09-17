import React, { useState, useMemo } from "react";
import "./App.css";

function Button({ children, onClick, variant = "primary" }) {
  return (
    <button className={`Button ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

function Input({ value, onChange, type = "text", placeholder, readOnly }) {
  return (
    <input
      className="Input"
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
    />
  );
}

function Textarea({ value, onChange }) {
  return <textarea className="Textarea" value={value} onChange={onChange} rows={3} />;
}

export default function App() {
  const [screen, setScreen] = useState("login");
  const [userEmail, setUserEmail] = useState("");
  const [businessName, setBusinessName] = useState("Kaffa Café");
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [isDraft, setIsDraft] = useState(false);

  const [title, setTitle] = useState("Buy 1 Get 1 Free Latte");
  const [desc, setDesc] = useState("Bring a friend and enjoy a free latte. Weekdays only.");
  const [discountType, setDiscountType] = useState("bogo");
  const [discountValue, setDiscountValue] = useState(50);
  const [expiry, setExpiry] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [limit, setLimit] = useState(100);
  const [terms, setTerms] = useState("One per customer. Show at checkout.");

  const previewLink = useMemo(() => {
    return `https://coupon.app/r/${encodeURIComponent(title.toLowerCase().replace(/ /g, "-"))}`;
  }, [title]);

  const shareText = `${businessName}: ${title} — ${desc} (Valid until ${expiry}). Redeem: ${previewLink}`;

  const handleLogin = () => {
    if (userEmail) setScreen("dashboard");
  };

  const handleSave = () => {
    setIsDraft(true);
    setScreen("preview");
  };

  const handleEdit = (coupon) => {
    setTitle(coupon.title);
    setDesc(coupon.desc);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setExpiry(coupon.expiry);
    setLimit(coupon.limit);
    setTerms(coupon.terms);
    setEditingCoupon(coupon);
    setScreen("create");
  };

  const requestDelete = (coupon) => {
    setDeleteTarget(coupon);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      setCoupons(coupons.filter((c) => c.id !== deleteTarget.id));
      setToastMessage(`Coupon "${deleteTarget.title}" deleted ✔️`);
      setDeleteTarget(null);
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  const finalizeCoupon = () => {
    if (isDraft) {
      const duplicate = coupons.find(
        (c) =>
          c.title.toLowerCase() === title.toLowerCase() &&
          c.expiry === expiry &&
          (!editingCoupon || c.id !== editingCoupon.id)
      );

      if (duplicate) {
        setToastMessage("⚠️ A coupon with this title and expiry already exists.");
        setTimeout(() => setToastMessage(""), 3000);
        return;
      }

      if (editingCoupon) {
        const updated = coupons.map((c) =>
          c.id === editingCoupon.id
            ? { ...c, title, desc, discountType, discountValue, expiry, limit, terms }
            : c
        );
        setCoupons(updated);
        setEditingCoupon(null);
        setToastMessage("Coupon updated ✔️");
      } else {
        const newCoupon = {
          id: Date.now().toString(),
          title,
          desc,
          discountType,
          discountValue,
          expiry,
          limit,
          terms,
          link: previewLink,
          uses: 0,
        };
        setCoupons([newCoupon, ...coupons]);
        setToastMessage("Coupon created ✔️");
      }

      setIsDraft(false);
      setTimeout(() => setToastMessage(""), 3000);
    }
    setScreen("dashboard");
  };


  return (
    <div className="App">
      <header className="Topbar">
        <div className="Logo">FABRIKA</div>
        <div className="Tagline">Coupon Web App Prototype</div>
      </header>

      {screen === "login" && (
        <div className="LoginBox">
          <h2>Welcome Back</h2>
          <p className="Subtext">Log in to create and share digital coupons</p>
          <label>Business Name</label>
          <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          <label>Email</label>
          <Input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="you@business.com"
          />
          <Button onClick={handleLogin}>Continue →</Button>
        </div>
      )}

      {screen === "dashboard" && (
        <div className="Dashboard">
          <h2>Welcome, {businessName}</h2>
          <div className="Metrics">
            <div className="Metric"><h3>{coupons.length}</h3><p>Active Coupons</p></div>
            <div className="Metric"><h3>{coupons.length * 10 + 20}</h3><p>Today’s Views</p></div>
            <div className="Metric"><h3>{coupons.reduce((a, c) => a + (c.uses || 0), 0)}</h3><p>Redemptions</p></div>
          </div>
          <Button onClick={() => setScreen("create")}>+ New Coupon</Button>
          <div className="CardList">
            {coupons.length === 0 ? (
              <p>No coupons yet.</p>
            ) : (
              coupons.map((c) => (
                <div key={c.id} className="CouponCard">
                  <div>
                    <strong>{c.title}</strong>
                    <p>Expires {c.expiry}</p>
                  </div>
                  <div>
                    <button className="SmallBtn" onClick={() => handleEdit(c)}>✏️ Edit</button>
                    <button className="SmallBtn danger" onClick={() => requestDelete(c)}>🗑 Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {screen === "create" && (
        <div className="FormGrid">
          <div className="FormSection">
            <h2>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</h2>
            <label>Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            <label>Description</label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} />
            <label>Discount Type</label>
            <select
              className="Input"
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
            >
              <option value="percent">% Off</option>
              <option value="amount">Birr Off</option>
              <option value="bogo">BOGO</option>
            </select>
            <label>Discount Value</label>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              disabled={discountType === "bogo"}
            />
            <label>Expiry Date</label>
            <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            <label>Limit</label>
            <Input type="number" value={limit} onChange={(e) => setLimit(e.target.value)} />
            <label>Terms</label>
            <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} />
            <div className="Actions">
              <Button onClick={handleSave}>
                {editingCoupon ? "Update & Preview" : "Save & Preview"}
              </Button>
              <Button variant="secondary" onClick={() => setScreen("dashboard")}>Cancel</Button>
            </div>
          </div>
          <div className="PreviewSection">
            <h2>Live Preview</h2>
            <div className="CouponPreview">
              <h3>{title}</h3>
              <p>{desc}</p>
              <span className="Badge">
                {discountType === "percent"
                  ? `${discountValue}% OFF`
                  : discountType === "amount"
                  ? `${discountValue} Birr OFF`
                  : "BOGO"}
              </span>
              <p>Expires {expiry}</p>
              <small>{terms}</small>
            </div>
          </div>
        </div>
      )}

      {screen === "preview" && (
        <div className="PreviewScreen">
          <h2>Share Coupon</h2>
          <div className="CouponPreview">
            <h3>{title}</h3>
            <p>{desc}</p>
            <span className="Badge">
              {discountType === "percent"
                ? `${discountValue}% OFF`
                : discountType === "amount"
                ? `${discountValue} Birr OFF`
                : "BOGO"}
            </span>
            <p>Expires {expiry}</p>
            <small>{terms}</small>
          </div>
          <label>Shareable Link</label>
          <Input value={previewLink} readOnly />
          <p className="ShareText">{shareText}</p>
          <Button onClick={finalizeCoupon}>Done</Button>
          <Button variant="secondary" onClick={() => setScreen("create")}>Edit Again</Button>
        </div>
      )}

      {deleteTarget && (
        <div className="ModalOverlay">
          <div className="Modal">
            <h3>Delete Coupon</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action
              cannot be undone.
            </p>
            <div className="Actions">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="primary" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="Toast">{toastMessage}</div>
      )}
    </div>
  );
}
