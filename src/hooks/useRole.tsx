import User from "@lib/User";
import { useEffect, useState } from "react";

export default function useRole() {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<any>([]);

  useEffect(() => {
    check();
  }, []);

  async function check() {
    let userRole = await User.role();
    if(userRole){ setHasAccess(userRole);}
    setLoading(false);
  }

  return [loading, hasAccess];
}