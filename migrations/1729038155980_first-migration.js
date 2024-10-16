exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS public.users
    (
        id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
        username character varying(100) COLLATE pg_catalog."default" NOT NULL,
        email character varying(100) COLLATE pg_catalog."default" NOT NULL,
        password character varying(255) COLLATE pg_catalog."default" NOT NULL,
        role character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'user'::character varying,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT users_pkey PRIMARY KEY (id),
        CONSTRAINT users_email_key UNIQUE (email)
    );

    CREATE TABLE IF NOT EXISTS public.categories
    (
        id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        description text COLLATE pg_catalog."default",
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT categories_pkey PRIMARY KEY (id),
        CONSTRAINT categories_name_key UNIQUE (name)
    );

    CREATE TABLE IF NOT EXISTS public.orders
    (
        id integer NOT NULL DEFAULT nextval('orders_id_seq'::regclass),
        cart_id integer,
        status character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'pending'::character varying,
        total numeric(10,2) NOT NULL,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        shipping_address_id integer,
        CONSTRAINT orders_pkey PRIMARY KEY (id),
        CONSTRAINT fk_shipping_address FOREIGN KEY (shipping_address_id)
            REFERENCES public.shipping_addresses (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE SET NULL,
        CONSTRAINT orders_cart_id_fkey FOREIGN KEY (cart_id)
            REFERENCES public.carts (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS public.shipping_addresses
    (
        id integer NOT NULL DEFAULT nextval('shipping_addresses_id_seq'::regclass),
        user_id integer,
        address_line_1 character varying(255) COLLATE pg_catalog."default" NOT NULL,
        address_line_2 character varying(255) COLLATE pg_catalog."default",
        city character varying(100) COLLATE pg_catalog."default" NOT NULL,
        state character varying(100) COLLATE pg_catalog."default",
        postal_code character varying(20) COLLATE pg_catalog."default",
        country character varying(100) COLLATE pg_catalog."default" NOT NULL,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT shipping_addresses_pkey PRIMARY KEY (id),
        CONSTRAINT fk_user FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS public.refresh_tokens
    (
        id integer NOT NULL DEFAULT nextval('refresh_tokens_id_seq'::regclass),
        user_id integer,
        token text COLLATE pg_catalog."default" NOT NULL,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id),
        CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS public.products
    (
        id integer NOT NULL DEFAULT nextval('products_id_seq'::regclass),
        name character varying(100) COLLATE pg_catalog."default" NOT NULL,
        description text COLLATE pg_catalog."default",
        price numeric(10,2) NOT NULL,
        category_id integer NOT NULL,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT products_pkey PRIMARY KEY (id),
        CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id)
            REFERENCES public.categories (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS public.coupons
    (
        id integer NOT NULL DEFAULT nextval('coupons_id_seq'::regclass),
        code character varying(50) COLLATE pg_catalog."default" NOT NULL,
        discount_type character varying(20) COLLATE pg_catalog."default" NOT NULL,
        discount_value numeric(10,2) NOT NULL,
        minimum_order_value numeric(10,2),
        expiration_date timestamp without time zone,
        usage_limit integer,
        times_used integer DEFAULT 0,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT coupons_pkey PRIMARY KEY (id),
        CONSTRAINT coupons_code_key UNIQUE (code),
        CONSTRAINT coupons_discount_type_check CHECK (discount_type::text = ANY (ARRAY['percentage'::character varying, 'fixed'::character varying, 'free_shipping'::character varying]::text[]))
    );

    CREATE TABLE IF NOT EXISTS public.carts
    (
        id integer NOT NULL DEFAULT nextval('carts_id_seq'::regclass),
        user_id integer,
        status character varying(50) COLLATE pg_catalog."default" NOT NULL DEFAULT 'active'::character varying,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        total numeric(10,2) NOT NULL DEFAULT 0,
        CONSTRAINT carts_pkey PRIMARY KEY (id),
        CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id)
            REFERENCES public.users (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE,
        CONSTRAINT status_check CHECK (status::text = ANY (ARRAY['active'::character varying, 'completed'::character varying, 'abandoned'::character varying]::text[]))
    );

    CREATE TABLE IF NOT EXISTS public.cart_coupons
    (
        id integer NOT NULL DEFAULT nextval('cart_coupons_id_seq'::regclass),
        cart_id integer,
        coupon_id integer,
        applied_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT cart_coupons_pkey PRIMARY KEY (id),
        CONSTRAINT fk_cart FOREIGN KEY (cart_id)
            REFERENCES public.carts (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE,
        CONSTRAINT fk_coupon FOREIGN KEY (coupon_id)
            REFERENCES public.coupons (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS public.cart_items
    (
        id integer NOT NULL DEFAULT nextval('cart_items_id_seq'::regclass),
        cart_id integer,
        product_id integer,
        quantity integer NOT NULL DEFAULT 1,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        price_at_addition numeric(10,2) NOT NULL DEFAULT 0,
        CONSTRAINT cart_items_pkey PRIMARY KEY (id),
        CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id)
            REFERENCES public.carts (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE,
        CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id)
            REFERENCES public.products (id) MATCH SIMPLE
            ON UPDATE NO ACTION
            ON DELETE CASCADE
    );
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS public.cart_items;
    DROP TABLE IF EXISTS public.cart_coupons;
    DROP TABLE IF EXISTS public.carts;
    DROP TABLE IF EXISTS public.coupons;
    DROP TABLE IF EXISTS public.products;
    DROP TABLE IF EXISTS public.refresh_tokens;
    DROP TABLE IF EXISTS public.shipping_addresses;
    DROP TABLE IF EXISTS public.orders;
    DROP TABLE IF EXISTS public.categories;
    DROP TABLE IF EXISTS public.users;
  `);
};
