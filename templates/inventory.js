export const inventory = () => {
    const date = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "2-digit",
        day:"2-digit"
    }).format(new Date());
    
    return {
        name:`ufhgwiuhrbfgw Inventory`,
        sheets:[
            {
                name: `Inventory`,
                slug: "inventory",
                fields: [
                    {
                        key:"title",
                        type:"string",
                        label:"Title"
                    },
                    {
                        key:"author",
                        type:"string",
                        label:"Author"
                    },
                    {
                        key:"isbn",
                        type:"string",
                        label:"ISBN"
                    },
                    {
                        key:"stock",
                        type:"number",
                        label:"Stock"
                    }
                ],
                actions:[]
            },
            {
                name: `Purchase Order`,
                slug:"purchase-order",
                fields:[
                    {
                        key:"title",
                        type:"string",
                        label:"Title"
                    },
                    {
                        key:"author",
                        type:"string",
                        label:"Author"
                    },
                    {
                        key:"isbn",
                        type:"string",
                        label:"ISBN"
                    },
                    {
                        key:"purchase",
                        type:"number",
                        label:"Purchase"
                    }
                ],
                actions: []
            }
        ]
    }
}